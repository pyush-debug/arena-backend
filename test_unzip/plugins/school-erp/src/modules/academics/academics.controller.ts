import { Controller } from '@nestjs/common';
import { BaseController } from '../../../../../src/core/sdk/base/base.controller';
import { AcademicsService } from './academics.service';
import { AcademicYearEntity } from '../../entities/academic-year.entity';

@Controller('academics/years')
export class AcademicsController extends BaseController<AcademicYearEntity> {
  constructor(private readonly academicsService: AcademicsService) {
    super(academicsService);
  }
}
