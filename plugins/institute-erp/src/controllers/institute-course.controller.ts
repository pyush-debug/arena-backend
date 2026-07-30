import { Controller } from '@nestjs/common';
import { BaseController } from '../../../../src/core/sdk/base/base.controller';
import { InstituteCourseService } from '../services/institute-course.service';
import { InstituteCourse } from '../entities/institute-course.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Institute')
@Controller('institute/institute-courses')
export class InstituteCourseController extends BaseController<InstituteCourse> {
  constructor(private readonly service: InstituteCourseService) {
    super(service);
  }
}
