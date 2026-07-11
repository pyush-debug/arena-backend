import { Controller } from '@nestjs/common';
import { BaseController } from '../../../../src/core/sdk/base/base.controller';
import { InstituteCompanyService } from '../services/institute-company.service';
import { InstituteCompanyEntity } from '../entities/institute-company.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Institute')
@Controller('institute/institute-companys')
export class InstituteCompanyController extends BaseController<InstituteCompanyEntity> {
  constructor(private readonly service: InstituteCompanyService) {
    super(service);
  }
}
