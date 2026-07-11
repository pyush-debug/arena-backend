import { Controller } from '@nestjs/common';
import { BaseController } from '../../../../src/core/sdk/base/base.controller';
import { InstituteDonationService } from '../services/institute-donation.service';
import { InstituteDonationEntity } from '../entities/institute-donation.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Institute')
@Controller('institute/institute-donations')
export class InstituteDonationController extends BaseController<InstituteDonationEntity> {
  constructor(private readonly service: InstituteDonationService) {
    super(service);
  }
}
