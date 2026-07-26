import { Controller } from '@nestjs/common';
import { BaseController } from '../../../../src/core/sdk/base/base.controller';
import { InstituteSkillService } from '../services/institute-skill.service';
import { InstituteSkillEntity } from '../entities/institute-skill.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Institute')
@Controller('institute/institute-skills')
export class InstituteSkillController extends BaseController<InstituteSkillEntity> {
  constructor(private readonly service: InstituteSkillService) {
    super(service);
  }
}
