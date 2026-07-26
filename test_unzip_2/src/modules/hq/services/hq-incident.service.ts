import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseService } from '../../../core/sdk/base/base.service';
import { HqIncidentEntity } from '../entities/hq-incident.entity';

@Injectable()
export class HqIncidentService extends BaseService<HqIncidentEntity> {
  constructor(
    @InjectRepository(HqIncidentEntity)
    repository: Repository<HqIncidentEntity>,
    eventEmitter: EventEmitter2,
  ) {
    super(repository, eventEmitter, 'Hq.HqIncident');
  }
}
