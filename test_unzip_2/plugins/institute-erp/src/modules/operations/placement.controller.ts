import { Controller } from '@nestjs/common';
import { BaseController } from '../../../../../src/core/sdk/base/base.controller';
import { PlacementService } from './placement.service';
import { InstitutePlacementEntity } from '../../entities/institute-placement.entity';

@Controller('institute/operations/placements')
export class PlacementController extends BaseController<InstitutePlacementEntity> {
  constructor(private readonly placementService: PlacementService) {
    super(placementService);
  }
}
