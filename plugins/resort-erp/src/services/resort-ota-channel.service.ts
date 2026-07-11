import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseService } from '../../../../src/core/sdk/base/base.service';
import { ResortOtaChannelEntity } from '../entities/resort-ota-channel.entity';

@Injectable()
export class ResortOtaChannelService extends BaseService<ResortOtaChannelEntity> {
  constructor(
    @InjectRepository(ResortOtaChannelEntity) repository: Repository<ResortOtaChannelEntity>,
    eventEmitter: EventEmitter2
  ) {
    super(repository, eventEmitter, 'Resort.ResortOtaChannel');
  }
}
