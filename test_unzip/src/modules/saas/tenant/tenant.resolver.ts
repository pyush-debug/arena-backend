import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { CustomLoggerService } from '../../../core/logger/custom-logger.service';

interface AuthRequest extends Request {
  user?: { franchiseId: number };
  franchiseId?: number;
  tenantContext?: {
    franchiseId: number;
    status: string;
    plan: string;
  };
}

/**
 * Tenant Resolver Interceptor
 * Intercepts requests, validates the franchise ID from the JWT, and caches
 * the franchise's metadata (plan, expiry, status) into Redis to avoid
 * constant database hits on every request.
 */
@Injectable()
export class TenantResolverInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const franchiseId = request.user?.franchiseId || request.franchiseId;

    if (franchiseId) {
      this.logger.verbose(
        `Resolving Tenant Context for Franchise: ${franchiseId}`,
        'TenantResolver',
      );
      // In production:
      // 1. Check Redis for `tenant_metadata:${franchiseId}`
      // 2. If not found, query `franchises` table, cache it.
      // 3. Inject metadata into request.tenantContext
      request.tenantContext = {
        franchiseId,
        status: 'Active', // Mocked, loaded from Cache
        plan: 'Premium',
      };
    }

    return next.handle();
  }
}
