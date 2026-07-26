import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from '../../core/logger/custom-logger.service';

@Injectable()
export class AuditService {
  constructor(private readonly logger: CustomLoggerService) {}

  /**
   * Logs an action to the unified `audit_logs` table.
   * This should be dispatched asynchronously via the Event Bus in production.
   */
  logAction(
    franchiseId: number,
    userId: number,
    action: string,
    entity: string,
    entityId: number,
    details?: Record<string, unknown>,
  ): Promise<void> {
    this.logger.log(
      `Audit: User ${userId} performed ${action} on ${entity} ${entityId} in Franchise ${franchiseId}. Details: ${JSON.stringify(details || {})}`,
      'AuditService',
    );
    // TODO: Publish to BullMQ queue or persist directly to `audit_logs` table
    return Promise.resolve();
  }
}
