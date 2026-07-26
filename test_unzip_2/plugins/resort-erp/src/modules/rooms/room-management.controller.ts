import { Controller } from '@nestjs/common';
import { BaseController } from '../../../../../src/core/sdk/base/base.controller';
import { RoomManagementService } from './room-management.service';
import { ResortRoomStatusLogEntity } from '../../entities/resort-room-status-log.entity';

@Controller('resort/rooms/status-logs')
export class RoomManagementController extends BaseController<ResortRoomStatusLogEntity> {
  constructor(private readonly roomService: RoomManagementService) {
    super(roomService);
  }
}
