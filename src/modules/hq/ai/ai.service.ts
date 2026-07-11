import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from '../../../core/logger/custom-logger.service';
import { ConfigurationEngine } from '../../saas/config/config.service';

@Injectable()
export class AiOperationsService {
  constructor(
    private readonly logger: CustomLoggerService,
    private readonly configEngine: ConfigurationEngine,
  ) {}

  /**
   * Controls global and per-franchise AI limits by tapping into the ConfigEngine.
   */
  async setFranchiseAiLimit(franchiseId: number, limit: number) {
    this.logger.log(
      `Adjusting AI Quota for Franchise ${franchiseId} to ${limit}`,
      'AiOpsService',
    );
    await this.configEngine.update(
      'Franchise',
      franchiseId,
      'ai_token_limit',
      limit,
    );
    return { success: true };
  }
}
