import { Controller } from '@nestjs/common';
import { BaseController } from '../../../../../src/core/sdk/base/base.controller';
import { AcademicsService } from './academics.service';
import { InstituteDepartmentEntity } from '../../entities/institute-department.entity';

@Controller('institute/academics/departments')
export class AcademicsController extends BaseController<InstituteDepartmentEntity> {
  constructor(private readonly academicsService: AcademicsService) {
    super(academicsService); // Base SDK isolation applied automatically
  }
}
