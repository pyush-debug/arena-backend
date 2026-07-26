import { Controller } from '@nestjs/common';
import { BaseController } from '../../../../src/core/sdk/base/base.controller';
import { InstituteFeeService } from '../services/institute-fee.service';
import { InstituteFeeEntity } from '../entities/institute-fee.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Institute')
@Controller('institute/institute-fees')
export class InstituteFeeController extends BaseController<InstituteFeeEntity> {
  constructor(private readonly service: InstituteFeeService) {
    super(service);
  }
}
