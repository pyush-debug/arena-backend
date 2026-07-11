import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CustomLoggerService } from '../../../core/logger/custom-logger.service';
import {
  ConfigurationUpdatedEvent,
  FranchiseCreatedEvent,
  FranchiseSuspendedEvent,
  PluginInstalledEvent,
} from '../../../core/events/payloads/enterprise.events';

@Injectable()
export class HqTimelineEventService {
  constructor(private readonly logger: CustomLoggerService) {}

  /**
   * Universal sink for the HQ Timeline.
   * Intercepts domain events and logs them cleanly into `hq_timeline`.
   */
  private recordTimelineEvent(
    eventType: string,
    description: string,
    metadata?: Record<string, unknown>,
  ) {
    this.logger.log(
      `[HQ Timeline] ${eventType}: ${description} | Meta: ${JSON.stringify(metadata || {})}`,
      'HqTimelineService',
    );
    // Implementation: TypeORM insert into `hq_timeline` table (Migration V037)
  }

  @OnEvent('franchise.created')
  handleFranchiseCreated(event: FranchiseCreatedEvent) {
    this.recordTimelineEvent(
      'FranchiseCreated',
      `Franchise ${event.franchiseId} onboarded on plan ${event.planType}`,
    );
  }

  @OnEvent('franchise.suspended')
  handleFranchiseSuspended(event: FranchiseSuspendedEvent) {
    this.recordTimelineEvent(
      'FranchiseSuspended',
      `Franchise ${event.franchiseId} suspended. Reason: ${event.reason}`,
    );
  }

  @OnEvent('config.updated')
  handleConfigUpdated(event: ConfigurationUpdatedEvent) {
    this.recordTimelineEvent(
      'ConfigurationChanged',
      `Scope [${event.scope}-${event.scopeId}] updated key: ${event.key}`,
      { value: event.value },
    );
  }

  @OnEvent('plugin.installed')
  handlePluginInstalled(event: PluginInstalledEvent) {
    this.recordTimelineEvent(
      'PluginInstalled',
      `Plugin ${event.pluginId} v${event.version} installed.`,
    );
  }
}
