import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CustomLoggerService } from '../../../core/logger/custom-logger.service';
import {
  UserLoggedInEvent,
  ConfigurationUpdatedEvent,
  PluginInstalledEvent,
} from '../../../core/events/payloads/enterprise.events';

/**
 * Enterprise Monitoring Hooks
 * Subscribes to the Event Bus and tracks metrics and anomalies.
 */
@Injectable()
export class MonitoringEngine {
  constructor(private readonly logger: CustomLoggerService) {}

  @OnEvent('user.logged_in')
  handleUserLogin(event: UserLoggedInEvent) {
    this.logger.debug(
      `[Metric] User ${event.userId} logged into Franchise ${event.franchiseId}`,
      'MonitoringEngine',
    );
    // E.g., Push to Prometheus / Grafana or internal stats table
  }

  @OnEvent('config.updated')
  handleConfigUpdate(event: ConfigurationUpdatedEvent) {
    this.logger.warn(
      `[Audit] Config '${event.key}' changed in scope ${event.scope} (${event.scopeId})`,
      'MonitoringEngine',
    );
  }

  @OnEvent('plugin.installed')
  handlePluginInstalled(event: PluginInstalledEvent) {
    this.logger.log(
      `[Metric] Plugin installed: ${event.pluginId} v${event.version}`,
      'MonitoringEngine',
    );
  }
}
