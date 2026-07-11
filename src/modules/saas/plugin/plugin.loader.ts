import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CustomLoggerService } from '../../../core/logger/custom-logger.service';
import { PluginInstalledEvent } from '../../../core/events/payloads/enterprise.events';

export interface PluginManifest {
  plugin_id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  main?: string;
  dependencies?: Record<string, string>;
  database_migrations?: string[];
  ui_menus?: any[];
  compatibility_matrix?: { core_version: string };
}

@Injectable()
export class PluginLoader implements OnModuleInit {
  private readonly pluginsDir = path.join(__dirname, '../../../../plugins');
  private loadedPlugins = new Map<string, PluginManifest>();

  constructor(
    private readonly logger: CustomLoggerService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  onModuleInit() {
    this.logger.log('Initializing Enterprise Plugin SDK...', 'PluginLoader');
    if (!fs.existsSync(this.pluginsDir)) {
      fs.mkdirSync(this.pluginsDir, { recursive: true });
    }
    this.scanAndLoadPlugins();
  }

  /**
   * Scans the plugins directory and loads manifest.json definitions.
   */
  private scanAndLoadPlugins() {
    const pluginFolders = fs.existsSync(this.pluginsDir)
      ? fs.readdirSync(this.pluginsDir)
      : [];

    for (const folder of pluginFolders) {
      const manifestPath = path.join(this.pluginsDir, folder, 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        try {
          const manifestFile = fs.readFileSync(manifestPath, 'utf8');
          const manifest = JSON.parse(manifestFile) as PluginManifest;

          this.validateManifest(manifest);
          this.validateCompatibility(manifest);

          this.loadedPlugins.set(manifest.plugin_id, manifest);

          this.logger.log(
            `Dynamically Loaded Plugin: ${manifest.name} (v${manifest.version})`,
            'PluginLoader',
          );

          // Future Phase: Dynamically mount the plugin's module into the HttpAdapter
          // const pluginModule = await import(path.join(this.pluginsDir, folder, 'index.js'));
          // await this.mountPluginControllers(pluginModule, manifest.routes.api_prefix);

          // Publish event
          this.eventEmitter.emit(
            'plugin.installed',
            new PluginInstalledEvent(manifest.plugin_id, manifest.version),
          );
        } catch (e) {
          this.logger.error(
            `Failed to load plugin manifest at ${manifestPath}: ${(e as Error).message}`,
            'PluginLoader',
          );
        }
      }
    }
  }

  private validateManifest(manifest: PluginManifest) {
    if (!manifest.plugin_id)
      throw new Error('Missing required manifest field: plugin_id');
    if (!manifest.name)
      throw new Error('Missing required manifest field: name');
    if (!manifest.version)
      throw new Error('Missing required manifest field: version');
  }

  private validateCompatibility(manifest: PluginManifest) {
    const matrix = manifest.compatibility_matrix;
    if (!matrix) return;
    const coreVersion = '1.0.0'; // Hardcoded core version check
    if (
      matrix.core_version !== `>=${coreVersion}` &&
      matrix.core_version !== coreVersion
    ) {
      throw new Error(
        `Incompatible Core Version: Plugin requires ${matrix.core_version}, Core is ${coreVersion}`,
      );
    }
  }

  getLoadedPlugins(): PluginManifest[] {
    return Array.from(this.loadedPlugins.values());
  }
}
