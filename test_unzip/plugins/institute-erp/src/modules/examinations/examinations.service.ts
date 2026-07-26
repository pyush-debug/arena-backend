import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseService } from '../../../../../src/core/sdk/base/base.service';
import { InstituteTranscriptEntity } from '../../entities/institute-transcript.entity';

@Injectable()
export class InstituteExaminationsService extends BaseService<InstituteTranscriptEntity> {
  constructor(
    @InjectRepository(InstituteTranscriptEntity)
    repository: Repository<InstituteTranscriptEntity>,
    eventEmitter: EventEmitter2,
  ) {
    super(repository, eventEmitter, 'InstituteERP.Examinations');
  }

  async afterCreate(franchiseId: number, transcript: InstituteTranscriptEntity): Promise<void> {
    this.eventEmitter.emit('transcript.generated', { franchiseId, transcript });
  }
}
