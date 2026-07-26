import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseService } from '../../../core/sdk/base/base.service';
import { HqTimelineEntity } from '../entities/hq-timeline.entity';

@Injectable()
export class HqTimelineService extends BaseService<HqTimelineEntity> {
  constructor(
    @InjectRepository(HqTimelineEntity)
    repository: Repository<HqTimelineEntity>,
    eventEmitter: EventEmitter2,
  ) {
    super(repository, eventEmitter, 'Hq.HqTimeline');
  }
}
