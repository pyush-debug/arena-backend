import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Franchise } from '../../iam/entities/franchise.entity';
import { User } from '../../iam/entities/user.entity';
import { Session } from '../../iam/entities/session.entity';
import { CustomLoggerService } from '../../../core/logger/custom-logger.service';

@Injectable()
export class OperationsService {
  constructor(
    @InjectRepository(Franchise)
    private readonly franchiseRepo: Repository<Franchise>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    private readonly logger: CustomLoggerService,
  ) {}

  async getDashboardMetrics() {
    this.logger.debug(
      'Fetching HQ Operations Dashboard Metrics',
      'OperationsService',
    );

    // In production, these would be heavily cached or materialized views.
    const liveFranchises = await this.franchiseRepo.count({
      where: { status: 'Active' },
    });
    const liveUsers = await this.userRepo.count({
      where: { status: 'Active' },
    });
    const activeSessions = await this.sessionRepo.count({
      where: { status: 'Active' },
    });

    // Other metrics (API Throughput, Queue Health) would be sourced from Redis/BullMQ instances.

    return {
      success: true,
      data: {
        liveFranchises,
        liveUsers,
        activeSessions,
        queueHealth: 'Optimal', // Mocked representation of BullMQ health
        databaseHealth: 'Connected',
        redisHealth: 'Connected',
      },
    };
  }
}
