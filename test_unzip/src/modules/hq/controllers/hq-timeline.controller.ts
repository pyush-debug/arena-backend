import { Controller } from '@nestjs/common';
import { BaseController } from '../../../core/sdk/base/base.controller';
import { HqTimelineService } from '../services/hq-timeline.service';
import { HqTimelineEntity } from '../entities/hq-timeline.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Hq')
@Controller('hq/hq-timelines')
export class HqTimelineController extends BaseController<HqTimelineEntity> {
  constructor(private readonly service: HqTimelineService) {
    super(service);
  }
}
