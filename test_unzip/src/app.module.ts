import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { configuration, envValidation } from './core/config';
import { LoggerModule } from './core/logger/logger.module';
import { DatabaseModule } from './core/database/database.module';
import { CacheModule } from './core/cache/cache.module';
import { QueueModule } from './core/queue/queue.module';
import { EventModule } from './core/events/event.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { HealthController } from './modules/health/health.controller';
import { AuditService } from './modules/audit/audit.service';
import { PluginLoader } from './modules/plugin/plugin.loader';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { IamModule } from './modules/iam/iam.module';
import { SaasModule } from './modules/saas/saas.module';
import { HqModule } from './modules/hq/hq.module';

// Registering Plugins explicitly for compile-time validation
import { SchoolErpModule } from '../plugins/school-erp/src/school-erp.module';
import { InstituteErpModule } from '../plugins/institute-erp/src/institute-erp.module';
import { ResortErpModule } from '../plugins/resort-erp/src/resort-erp.module';

import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100, // 100 requests per minute
    }]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: envValidation,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', '..', 'Downloads', 'actions', 'uploads'),
      serveRoot: '/uploads/',
      exclude: ['/v1/(.*)'],
    }),
    ScheduleModule.forRoot(),
    LoggerModule,
    DatabaseModule,
    CacheModule,
    QueueModule,
    EventModule,
    IamModule,
    SaasModule,
    HqModule,
    SchoolErpModule,
    InstituteErpModule,
    ResortErpModule,
  ],
  controllers: [HealthController, AppController],
  providers: [
    AuditService, 
    PluginLoader, 
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
