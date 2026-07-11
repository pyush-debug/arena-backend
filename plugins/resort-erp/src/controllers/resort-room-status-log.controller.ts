import { Controller } from '@nestjs/common';
import { BaseController } from '../../../../src/core/sdk/base/base.controller';
import { ResortRoomStatusLogService } from '../services/resort-room-status-log.service';
import { ResortRoomStatusLogEntity } from '../entities/resort-room-status-log.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Resort')
@Controller('resort/resort-room-status-logs')
export class ResortRoomStatusLogController extends BaseController<ResortRoomStatusLogEntity> {
  constructor(private readonly service: ResortRoomStatusLogService) {
    super(service);
  }
}
