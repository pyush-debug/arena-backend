import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseService } from '../../../../../src/core/sdk/base/base.service';
import { ResortRoomStatusLogEntity } from '../../entities/resort-room-status-log.entity';

@Injectable()
export class RoomManagementService extends BaseService<ResortRoomStatusLogEntity> {
  constructor(
    @InjectRepository(ResortRoomStatusLogEntity)
    repository: Repository<ResortRoomStatusLogEntity>,
    eventEmitter: EventEmitter2,
  ) {
    super(repository, eventEmitter, 'ResortERP.RoomManagement');
  }

  async afterCreate(franchiseId: number, log: ResortRoomStatusLogEntity): Promise<void> {
    // Publish inventory sync events for the OTA Channel Manager
    if (log.status === 'Available') {
      this.eventEmitter.emit('room.available', { franchiseId, log });
    } else if (log.status === 'Blocked' || log.status === 'Maintenance') {
      this.eventEmitter.emit('room.blocked', { franchiseId, log });
    }
  }
}
