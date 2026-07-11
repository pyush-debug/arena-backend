import { Controller } from '@nestjs/common';
import { BaseController } from '../../../core/sdk/base/base.controller';
import { HqIncidentService } from '../services/hq-incident.service';
import { HqIncidentEntity } from '../entities/hq-incident.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Hq')
@Controller('hq/hq-incidents')
export class HqIncidentController extends BaseController<HqIncidentEntity> {
  constructor(private readonly service: HqIncidentService) {
    super(service);
  }
}
