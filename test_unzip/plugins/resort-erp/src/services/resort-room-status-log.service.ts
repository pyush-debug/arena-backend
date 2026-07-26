import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseService } from '../../../../src/core/sdk/base/base.service';
import { ResortRoomStatusLogEntity } from '../entities/resort-room-status-log.entity';

@Injectable()
export class ResortRoomStatusLogService extends BaseService<ResortRoomStatusLogEntity> {
  constructor(
    @InjectRepository(ResortRoomStatusLogEntity) repository: Repository<ResortRoomStatusLogEntity>,
    eventEmitter: EventEmitter2
  ) {
    super(repository, eventEmitter, 'Resort.ResortRoomStatusLog');
  }
}
