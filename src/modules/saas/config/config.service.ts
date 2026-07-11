import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { REDIS_CLIENT } from '../../../core/cache/cache.module';
import { Redis } from 'ioredis';
import { CustomLoggerService } from '../../../core/logger/custom-logger.service';
import { ConfigurationUpdatedEvent } from '../../../core/events/payloads/enterprise.events';

@Injectable()
export class ConfigurationEngine {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: CustomLoggerService,
  ) {}

  /**
   * Resolves a configuration key evaluating the strict hierarchy:
   * Global -> HQ -> Franchise -> Branch -> User
   */
  async get(
    key: string,
    context: { franchiseId?: number; branchId?: number; userId?: number },
  ): Promise<any> {
    const namespaces = [
      context.userId ? `config:user_${context.userId}:${key}` : null,
      context.branchId ? `config:branch_${context.branchId}:${key}` : null,
      context.franchiseId
        ? `config:franchise_${context.franchiseId}:${key}`
        : null,
      `config:hq:${key}`,
      `config:global:${key}`,
    ].filter(Boolean) as string[];

    // Check Redis cache hierarchy
    for (const ns of namespaces) {
      const cached = await this.redisClient.get(ns);
      if (cached !== null) {
        return JSON.parse(cached);
      }
    }

    // If not in cache, fallback to DB fetch (mocked here)
    // DB query checks `configurations` table for the scopes
    return null; // Return default
  }

  /**
   * Updates a configuration and invalidates the cached hierarchy.
   */
  async update(
    scope: string,
    scopeId: number | null,
    key: string,
    value: any,
  ): Promise<void> {
    const ns = scopeId
      ? `config:${scope.toLowerCase()}_${scopeId}:${key}`
      : `config:${scope.toLowerCase()}:${key}`;
    await this.redisClient.set(ns, JSON.stringify(value));

    this.logger.log(
      `Configuration ${key} updated for Scope [${scope} - ${scopeId || 'Global'}]`,
      'ConfigEngine',
    );

    // Publish to Event Bus
    this.eventEmitter.emit(
      'config.updated',
      new ConfigurationUpdatedEvent(scope, scopeId, key, value),
    );
  }
}
