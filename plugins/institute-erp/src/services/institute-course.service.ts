import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseService } from '../../../../src/core/sdk/base/base.service';
import { InstituteCourse } from '../entities/institute-course.entity';

@Injectable()
export class InstituteCourseService extends BaseService<InstituteCourse> {
  constructor(
    @InjectRepository(InstituteCourse) repository: Repository<InstituteCourse>,
    eventEmitter: EventEmitter2
  ) {
    super(repository, eventEmitter, 'Institute.InstituteCourse');
  }
}
