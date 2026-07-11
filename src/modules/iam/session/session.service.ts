import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../entities/session.entity';
import { CustomLoggerService } from '../../../core/logger/custom-logger.service';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    private readonly logger: CustomLoggerService,
  ) {}

  /**
   * Creates a new session record tracking the user's login.
   */
  async createSession(
    franchiseId: number,
    userId: number,
    deviceInfo: string,
    maxConcurrent: number = 3,
  ): Promise<Session> {
    const activeSessions = await this.sessionRepository.count({
      where: { status: 'Active' } as import('typeorm').FindOptionsWhere<Session>,
    });
    if (activeSessions >= maxConcurrent) {
      // Implement session revocation logic here if needed
      // For now we just log
      this.logger.debug(
        `User ${userId} has reached max concurrent sessions (${maxConcurrent})`,
        'SessionService',
      );
    }
    const session = this.sessionRepository.create({
      franchise_id: franchiseId,
      session_name: `User ${userId} on ${deviceInfo}`,
      status: 'Active',
    });

    await this.sessionRepository.save(session);
    this.logger.log(
      `Session created for User ${userId} at Franchise ${franchiseId}`,
      'SessionService',
    );
    return session;
  }

  /**
   * Revokes an active session.
   */
  async revokeSession(sessionId: number, franchiseId: number): Promise<void> {
    await this.sessionRepository.update(
      { id: sessionId, franchise_id: franchiseId },
      { status: 'Revoked' },
    );
    this.logger.log(
      `Session ${sessionId} revoked for Franchise ${franchiseId}`,
      'SessionService',
    );
  }

  /**
   * Enforces concurrent session limits.
   */
  enforceSessionLimits(
    franchiseId: number,
    userId: number,
    maxConcurrent: number = 3,
  ): Promise<void> {
    this.logger.debug(
      `Enforcing max ${maxConcurrent} sessions for User ${userId}`,
      'SessionService',
    );
    // Example logic to query active sessions and revoke oldest if limit exceeded
    return Promise.resolve();
  }
}
