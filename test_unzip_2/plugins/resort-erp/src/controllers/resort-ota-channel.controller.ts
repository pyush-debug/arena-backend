import { Controller } from '@nestjs/common';
import { BaseController } from '../../../../src/core/sdk/base/base.controller';
import { ResortOtaChannelService } from '../services/resort-ota-channel.service';
import { ResortOtaChannelEntity } from '../entities/resort-ota-channel.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Resort')
@Controller('resort/resort-ota-channels')
export class ResortOtaChannelController extends BaseController<ResortOtaChannelEntity> {
  constructor(private readonly service: ResortOtaChannelService) {
    super(service);
  }
}
