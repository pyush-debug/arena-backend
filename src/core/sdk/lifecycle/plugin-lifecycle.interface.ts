export interface IPluginLifecycle {
  /** Triggered when plugin is first installed */
  onInstall(franchiseId: number): Promise<void>;

  /** Triggered when plugin is enabled after suspension */
  onEnable(franchiseId: number): Promise<void>;

  /** Triggered when HQ suspends the plugin for a tenant */
  onSuspend(franchiseId: number): Promise<void>;

  /** Triggered when plugin is disabled by choice */
  onDisable(franchiseId: number): Promise<void>;

  /** Triggered during a version upgrade */
  onUpgrade(franchiseId: number, previousVersion: string): Promise<void>;

  /** Triggered during a version rollback */
  onRollback(franchiseId: number, targetVersion: string): Promise<void>;

  /** Triggered to purge the plugin from the tenant */
  onUninstall(franchiseId: number): Promise<void>;

  /** Triggered to run self-healing scripts */
  onRepair(franchiseId: number): Promise<void>;

  /** Triggered to validate database state */
  onValidate(franchiseId: number): Promise<boolean>;
}
