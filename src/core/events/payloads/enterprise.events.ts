/**
 * Enterprise Strongly Typed Event Payloads for Event Bus decoupled communication.
 */

export class UserLoggedInEvent {
  constructor(
    public readonly userId: number,
    public readonly franchiseId: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class UserLoggedOutEvent {
  constructor(
    public readonly userId: number,
    public readonly sessionId: number,
  ) {}
}

export class FranchiseCreatedEvent {
  constructor(
    public readonly franchiseId: number,
    public readonly planType: string,
  ) {}
}

export class FranchiseSuspendedEvent {
  constructor(
    public readonly franchiseId: number,
    public readonly reason: string,
  ) {}
}

export class SubscriptionExpiredEvent {
  constructor(
    public readonly franchiseId: number,
    public readonly expiryDate: Date,
  ) {}
}

export class SubscriptionRenewedEvent {
  constructor(
    public readonly franchiseId: number,
    public readonly newExpiryDate: Date,
    public readonly amountPaid: number,
  ) {}
}

export class FeatureEnabledEvent {
  constructor(
    public readonly franchiseId: number,
    public readonly featureCode: string,
  ) {}
}

export class FeatureDisabledEvent {
  constructor(
    public readonly franchiseId: number,
    public readonly featureCode: string,
  ) {}
}

export class ConfigurationUpdatedEvent {
  constructor(
    public readonly scope: string,
    public readonly scopeId: number | null,
    public readonly key: string,
    public readonly value: any,
  ) {}
}

export class ThemeChangedEvent {
  constructor(
    public readonly franchiseId: number,
    public readonly newColor: string,
  ) {}
}

export class PluginInstalledEvent {
  constructor(
    public readonly pluginId: string,
    public readonly version: string,
  ) {}
}

export class BranchCreatedEvent {
  constructor(
    public readonly branchId: number,
    public readonly franchiseId: number,
  ) {}
}
