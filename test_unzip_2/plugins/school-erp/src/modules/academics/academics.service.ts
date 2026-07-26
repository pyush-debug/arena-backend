import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseService } from '../../../../../src/core/sdk/base/base.service';
import { AcademicYearEntity } from '../../entities/academic-year.entity';

@Injectable()
export class AcademicsService extends BaseService<AcademicYearEntity> {
  constructor(
    @InjectRepository(AcademicYearEntity)
    repository: Repository<AcademicYearEntity>,
    eventEmitter: EventEmitter2,
  ) {
    super(repository, eventEmitter, 'SchoolERP.AcademicYear');
  }
}
