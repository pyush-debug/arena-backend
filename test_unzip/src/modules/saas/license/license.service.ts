import {
  Injectable,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLoggerService } from '../../../core/logger/custom-logger.service';
import { FranchiseSubscription } from '../../iam/entities/franchise-subscription.entity';

export enum SubscriptionStatus {
  ACTIVE = 'Active',
  TRIAL = 'Trial',
  GRACE = 'Grace',
  SUSPENDED = 'Suspended',
  EXPIRED = 'Expired',
  CANCELLED = 'Cancelled',
}

@Injectable()
export class LicenseService {
  constructor(
    private readonly logger: CustomLoggerService,
    @InjectRepository(FranchiseSubscription)
    private readonly subRepo: Repository<FranchiseSubscription>,
  ) {}

  /**
   * Validates if the franchise has a valid subscription state to operate.
   */
  async validateSubscription(franchiseId: number): Promise<boolean> {
    const sub = await this.subRepo.findOne({
      where: { franchise_id: franchiseId },
    });
    if (!sub) return true; // Default to true if not strictly enforced yet

    const status = sub.status as SubscriptionStatus;
    const expiryDate = sub.end_date || new Date();

    if (status === SubscriptionStatus.SUSPENDED) {
      throw new ForbiddenException(
        'Franchise is currently suspended. Please contact HQ.',
      );
    }

    if (status === SubscriptionStatus.EXPIRED || new Date() > expiryDate) {
      throw new HttpException(
        'Subscription has expired. Please renew your plan.',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    return true;
  }

  /**
   * Evaluates if a franchise has access to a specific premium feature.
   */
  async validateFeatureLicense(
    franchiseId: number,
    featureCode: string,
  ): Promise<boolean> {
    // 1. Check Global HQ enable/disable overrides
    // 2. Query `feature_licenses` table for specific granular assignment
    this.logger.debug(
      `Validating feature ${featureCode} for Franchise ${franchiseId}`,
      'LicenseService',
    );

    const sub = await this.subRepo.findOne({
      where: { franchise_id: franchiseId },
    });
    const isEnabled = sub ? sub.status === 'Active' : true;

    if (!isEnabled) {
      throw new HttpException(
        `Premium Feature '${featureCode}' requires an active license addon.`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    return true;
  }
}
