import { Injectable, OnModuleInit } from '@nestjs/common';
import { CustomLoggerService } from '../../core/logger/custom-logger.service';

/**
 * Plugin Loader Base
 * Responsible for dynamically loading vertical ERP modules (e.g., Hospital, Gym)
 * based on active franchise subscriptions.
 */
@Injectable()
export class PluginLoader implements OnModuleInit {
  constructor(private readonly logger: CustomLoggerService) {}

  onModuleInit() {
    this.logger.log(
      'Plugin System Initialized. Checking for active modules...',
      'PluginLoader',
    );
    // Implementation to load modules from system_plugins
  }
}
