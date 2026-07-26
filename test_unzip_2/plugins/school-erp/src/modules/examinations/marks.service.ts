import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseService } from '../../../../../src/core/sdk/base/base.service';
import { MarkEntity } from '../../entities/mark.entity';

@Injectable()
export class MarksService extends BaseService<MarkEntity> {
  constructor(
    @InjectRepository(MarkEntity)
    repository: Repository<MarkEntity>,
    eventEmitter: EventEmitter2,
  ) {
    super(repository, eventEmitter, 'SchoolERP.Marks');
  }

  // Domain Event Hook
  async afterCreate(franchiseId: number, mark: MarkEntity): Promise<void> {
    // Notify parents when marks are uploaded
    this.eventEmitter.emit('exam.graded', { franchiseId, mark });
  }
}
