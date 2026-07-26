import { IUiMetadata } from '../metadata/ui-metadata.interface';

export interface IPluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  category: 'School' | 'Institute' | 'Resort' | 'Core' | 'Hospital';
  dependencies: string[];
  permissions: string[];

  // Advanced Compatibility
  compatibility_matrix: {
    core_version: string;
    api_version: string;
    database_version: string;
  };

  // Routing & Features
  routes: {
    api_prefix: string;
  };
  feature_flags: Record<string, boolean>;

  // Tasks
  cron_jobs?: ICronJobDefinition[];
  migrations?: string;

  // UI Payload
  ui_metadata?: IUiMetadata;

  events?: {
    consumes: string[];
    produces: string[];
  };
}

export interface ICronJobDefinition {
  name: string;
  schedule: string;
  handler: string;
}
