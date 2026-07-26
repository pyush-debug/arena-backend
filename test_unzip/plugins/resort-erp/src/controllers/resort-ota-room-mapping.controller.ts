import { Controller } from '@nestjs/common';
import { BaseController } from '../../../../src/core/sdk/base/base.controller';
import { ResortOtaRoomMappingService } from '../services/resort-ota-room-mapping.service';
import { ResortOtaRoomMappingEntity } from '../entities/resort-ota-room-mapping.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Resort')
@Controller('resort/resort-ota-room-mappings')
export class ResortOtaRoomMappingController extends BaseController<ResortOtaRoomMappingEntity> {
  constructor(private readonly service: ResortOtaRoomMappingService) {
    super(service);
  }
}
