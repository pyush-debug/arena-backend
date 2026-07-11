import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FranchiseSubscription } from '../iam/entities/franchise-subscription.entity';
import { Franchise } from '../iam/entities/franchise.entity';

import { TenantResolverInterceptor } from './tenant/tenant.resolver';
import { LicenseService } from './license/license.service';
import { FeatureGuard } from './license/feature.guard';
import { ConfigurationEngine } from './config/config.service';
import { PluginLoader } from './plugin/plugin.loader';
import { NotificationEngine } from './notification/notification.engine';
import { MonitoringEngine } from './monitoring/monitoring.engine';
import { ManifestController } from './plugin/manifest.controller';
import { DynamicController } from './plugin/dynamic.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FranchiseSubscription, Franchise])],
  controllers: [ManifestController, DynamicController],
  providers: [
    { provide: 'BullQueue_email_queue', useValue: {} },
    { provide: 'BullQueue_sms_queue', useValue: {} },
    { provide: 'BullQueue_whatsapp_queue', useValue: {} },
    { provide: 'BullQueue_push_queue', useValue: {} },
    TenantResolverInterceptor,
    LicenseService,
    FeatureGuard,
    ConfigurationEngine,
    PluginLoader,
    NotificationEngine,
    MonitoringEngine,
  ],
  exports: [
    TenantResolverInterceptor,
    LicenseService,
    FeatureGuard,
    ConfigurationEngine,
    NotificationEngine,
  ],
})
export class SaasModule {}
