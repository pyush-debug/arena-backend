import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LicenseService } from './license.service';

interface AuthorizedRequest {
  tenantContext?: { franchiseId: number };
  user?: { franchise_id: number };
}

export const REQUIRE_FEATURE_KEY = 'require_feature';

/**
 * Enterprise License Guard
 * Executed before any protected API to verify:
 * 1. The overall franchise subscription is active.
 * 2. The specific feature/module requested is licensed and enabled.
 */
@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private licenseService: LicenseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.getAllAndOverride<string>(
      REQUIRE_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest<AuthorizedRequest>();
    const franchiseId =
      request.tenantContext?.franchiseId || request.user?.franchise_id;

    if (!franchiseId) {
      // Allow HQ SuperAdmins to bypass, or reject if tenant context is missing on tenant routes
      return true;
    }

    // 1. Validate Base Subscription
    await this.licenseService.validateSubscription(franchiseId);

    // 2. Validate Specific Feature License (if route is protected by @RequireFeature)
    if (requiredFeature) {
      await this.licenseService.validateFeatureLicense(
        franchiseId,
        requiredFeature,
      );
    }

    return true;
  }
}
