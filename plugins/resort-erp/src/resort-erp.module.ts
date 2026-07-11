import { ResortGuestProfileExtService } from './services/resort-guest-profile-ext.service';
import { ResortPricingRuleService } from './services/resort-pricing-rule.service';
import { ResortPaymentService } from './services/resort-payment.service';
import { ResortInvoiceItemService } from './services/resort-invoice-item.service';
import { ResortInvoiceService } from './services/resort-invoice.service';
import { ResortRoomStatusLogService } from './services/resort-room-status-log.service';
import { ResortOtaRoomMappingService } from './services/resort-ota-room-mapping.service';
import { ResortOtaChannelService } from './services/resort-ota-channel.service';
import { ResortGuestProfileExtController } from './controllers/resort-guest-profile-ext.controller';
import { ResortPricingRuleController } from './controllers/resort-pricing-rule.controller';
import { ResortPaymentController } from './controllers/resort-payment.controller';
import { ResortInvoiceItemController } from './controllers/resort-invoice-item.controller';
import { ResortInvoiceController } from './controllers/resort-invoice.controller';
import { ResortRoomStatusLogController } from './controllers/resort-room-status-log.controller';
import { ResortOtaRoomMappingController } from './controllers/resort-ota-room-mapping.controller';
import { ResortOtaChannelController } from './controllers/resort-ota-channel.controller';
import { ResortGuestProfileExtEntity } from './entities/resort-guest-profile-ext.entity';
import { ResortPaymentEntity } from './entities/resort-payment.entity';
import { ResortInvoiceItemEntity } from './entities/resort-invoice-item.entity';
import { ResortInvoiceEntity } from './entities/resort-invoice.entity';
import { ResortOtaRoomMappingEntity } from './entities/resort-ota-room-mapping.entity';
import { ResortOtaChannelEntity } from './entities/resort-ota-channel.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ResortRoomStatusLogEntity } from './entities/resort-room-status-log.entity';
import { ResortPricingRuleEntity } from './entities/resort-pricing-rule.entity';

import { RoomManagementController } from './modules/rooms/room-management.controller';
import { RoomManagementService } from './modules/rooms/room-management.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ResortRoomStatusLogEntity,
      ResortPricingRuleEntity,
      ResortOtaChannelEntity,
      ResortOtaRoomMappingEntity,
      ResortInvoiceEntity,
      ResortInvoiceItemEntity,
      ResortPaymentEntity,
      ResortGuestProfileExtEntity
    ])
  ],
  controllers: [
    RoomManagementController,
    ResortOtaChannelController,
    ResortOtaRoomMappingController,
    ResortRoomStatusLogController,
    ResortInvoiceController,
    ResortInvoiceItemController,
    ResortPaymentController,
    ResortPricingRuleController,
    ResortGuestProfileExtController
  ],
  providers: [
    RoomManagementService,
    ResortOtaChannelService,
    ResortOtaRoomMappingService,
    ResortRoomStatusLogService,
    ResortInvoiceService,
    ResortInvoiceItemService,
    ResortPaymentService,
    ResortPricingRuleService,
    ResortGuestProfileExtService
  ],
  exports: [
    RoomManagementService,
  ]
})
export class ResortErpModule {}
