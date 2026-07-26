import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseService } from '../../../../src/core/sdk/base/base.service';
import { ResortGuestProfileExtEntity } from '../entities/resort-guest-profile-ext.entity';

@Injectable()
export class ResortGuestProfileExtService extends BaseService<ResortGuestProfileExtEntity> {
  constructor(
    @InjectRepository(ResortGuestProfileExtEntity) repository: Repository<ResortGuestProfileExtEntity>,
    eventEmitter: EventEmitter2
  ) {
    super(repository, eventEmitter, 'Resort.ResortGuestProfileExt');
  }
}
