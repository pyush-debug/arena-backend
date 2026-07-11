import { Controller } from '@nestjs/common';
import { BaseController } from '../../../../../src/core/sdk/base/base.controller';
import { InstituteExaminationsService } from './examinations.service';
import { InstituteTranscriptEntity } from '../../entities/institute-transcript.entity';

@Controller('institute/academics/examinations')
export class InstituteExaminationsController extends BaseController<InstituteTranscriptEntity> {
  constructor(private readonly examsService: InstituteExaminationsService) {
    super(examsService);
  }
}
