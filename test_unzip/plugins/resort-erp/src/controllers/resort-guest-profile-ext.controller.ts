import { Controller } from '@nestjs/common';
import { BaseController } from '../../../../src/core/sdk/base/base.controller';
import { ResortGuestProfileExtService } from '../services/resort-guest-profile-ext.service';
import { ResortGuestProfileExtEntity } from '../entities/resort-guest-profile-ext.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Resort')
@Controller('resort/resort-guest-profile-exts')
export class ResortGuestProfileExtController extends BaseController<ResortGuestProfileExtEntity> {
  constructor(private readonly service: ResortGuestProfileExtService) {
    super(service);
  }
}
