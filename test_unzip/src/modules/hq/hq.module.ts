import { HqIncidentService } from './services/hq-incident.service';
import { HqTimelineService } from './services/hq-timeline.service';
import { HqIncidentController } from './controllers/hq-incident.controller';
import { HqTimelineController } from './controllers/hq-timeline.controller';
import { HqIncidentEntity } from './entities/hq-incident.entity';
import { HqTimelineEntity } from './entities/hq-timeline.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SaasModule } from '../saas/saas.module';
import { IamModule } from '../iam/iam.module';
import { Franchise } from '../iam/entities/franchise.entity';
import { User } from '../iam/entities/user.entity';
import { Session } from '../iam/entities/session.entity';
import { FranchiseSubscription } from '../iam/entities/franchise-subscription.entity';
import { FranchisePayment } from '../iam/entities/franchise-payment.entity';
import { SystemNotification } from '../saas/notification/entities/system-notification.entity';

import { OperationsController } from './operations/operations.controller';
import { CommandsController } from './commands/commands.controller';
import { RevenueController } from './revenue/revenue.controller';

import { OperationsService } from './operations/operations.service';
import { HqTimelineEventService } from './timeline/timeline.service';
import { CommandsService } from './commands/commands.service';
import { IncidentService } from './incident/incident.service';
import { RevenueService } from './revenue/revenue.service';
import { DeploymentService } from './deployment/deployment.service';
import { AiOperationsService } from './ai/ai.service';
import { AnalyticsService } from './analytics/analytics.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Franchise,
      User,
      Session,
      FranchiseSubscription,
      FranchisePayment,
      SystemNotification,
      HqTimelineEntity,
      HqIncidentEntity,
    ]),
    SaasModule,
    IamModule,
  ],
  controllers: [
    OperationsController,
    CommandsController,
    RevenueController,
    HqTimelineController,
    HqIncidentController,
  ],
  providers: [
    OperationsService,
    HqTimelineService,
    HqTimelineEventService,
    CommandsService,
    IncidentService,
    RevenueService,
    DeploymentService,
    AiOperationsService,
    AnalyticsService,
    HqIncidentService,
  ],
})
export class HqModule {}
