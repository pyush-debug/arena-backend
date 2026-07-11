import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseService } from '../../../../src/core/sdk/base/base.service';
import { ResortOtaRoomMappingEntity } from '../entities/resort-ota-room-mapping.entity';

@Injectable()
export class ResortOtaRoomMappingService extends BaseService<ResortOtaRoomMappingEntity> {
  constructor(
    @InjectRepository(ResortOtaRoomMappingEntity) repository: Repository<ResortOtaRoomMappingEntity>,
    eventEmitter: EventEmitter2
  ) {
    super(repository, eventEmitter, 'Resort.ResortOtaRoomMapping');
  }
}
