import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Redis } from 'ioredis';
import { Franchise } from '../../iam/entities/franchise.entity';
import { REDIS_CLIENT } from '../../../core/cache/cache.module';
import { FranchiseSuspendedEvent } from '../../../core/events/payloads/enterprise.events';
import { CustomLoggerService } from '../../../core/logger/custom-logger.service';

@Injectable()
export class CommandsService {
  constructor(
    @InjectRepository(Franchise)
    private readonly franchiseRepo: Repository<Franchise>,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: CustomLoggerService,
  ) {}

  async suspendFranchise(franchiseId: number, reason: string) {
    this.logger.warn(
      `HQ Command Executed: Suspending Franchise ${franchiseId}`,
      'CommandsService',
    );

    // Update State Table
    await this.franchiseRepo.update(franchiseId, { status: 'Suspended' });

    // Publish Event (Captured by Timeline & Notification services)
    this.eventEmitter.emit(
      'franchise.suspended',
      new FranchiseSuspendedEvent(franchiseId, reason),
    );

    // Clear caching specific to this franchise
    await this.redisClient.del(`tenant_metadata:${franchiseId}`);

    return {
      success: true,
      message: `Franchise ${franchiseId} suspended successfully.`,
    };
  }

  async resumeFranchise(franchiseId: number) {
    this.logger.log(
      `HQ Command Executed: Resuming Franchise ${franchiseId}`,
      'CommandsService',
    );
    await this.franchiseRepo.update(franchiseId, { status: 'Active' });
    await this.redisClient.del(`tenant_metadata:${franchiseId}`);
    return {
      success: true,
      message: `Franchise ${franchiseId} resumed successfully.`,
    };
  }

  async clearCache() {
    this.logger.warn(
      `HQ Command Executed: Global Cache Flush`,
      'CommandsService',
    );
    await this.redisClient.flushdb();
    return { success: true, message: 'Platform cache cleared successfully.' };
  }
}
