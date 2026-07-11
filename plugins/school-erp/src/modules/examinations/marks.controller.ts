import { Controller } from '@nestjs/common';
import { BaseController } from '../../../../../src/core/sdk/base/base.controller';
import { MarksService } from './marks.service';
import { MarkEntity } from '../../entities/mark.entity';

@Controller('academics/marks')
export class MarksController extends BaseController<MarkEntity> {
  constructor(private readonly marksService: MarksService) {
    super(marksService); // Full Tenant Isolation inherited
  }
}
