import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseService } from '../../../../../src/core/sdk/base/base.service';
import { InstituteDepartmentEntity } from '../../entities/institute-department.entity';

@Injectable()
export class AcademicsService extends BaseService<InstituteDepartmentEntity> {
  constructor(
    @InjectRepository(InstituteDepartmentEntity)
    repository: Repository<InstituteDepartmentEntity>,
    eventEmitter: EventEmitter2,
  ) {
    super(repository, eventEmitter, 'InstituteERP.Academics');
  }
}
