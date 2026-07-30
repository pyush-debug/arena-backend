import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../../../src/core/sdk/base/base.service';
import { InstituteCourse } from '../entities/institute-course.entity';

@Injectable()
export class InstituteCourseService extends BaseService<InstituteCourse> {
  constructor(
    @InjectRepository(InstituteCourse)
    private readonly repository: Repository<InstituteCourse>,
  ) {
    super(repository);
  }
}
