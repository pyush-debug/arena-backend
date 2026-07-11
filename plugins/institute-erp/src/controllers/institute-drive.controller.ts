import { Controller } from '@nestjs/common';
import { BaseController } from '../../../../src/core/sdk/base/base.controller';
import { InstituteDriveService } from '../services/institute-drive.service';
import { InstituteDriveEntity } from '../entities/institute-drive.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Institute')
@Controller('institute/institute-drives')
export class InstituteDriveController extends BaseController<InstituteDriveEntity> {
  constructor(private readonly service: InstituteDriveService) {
    super(service);
  }
}
