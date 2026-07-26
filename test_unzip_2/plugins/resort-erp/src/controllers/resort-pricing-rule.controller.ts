import { Controller } from '@nestjs/common';
import { BaseController } from '../../../../src/core/sdk/base/base.controller';
import { ResortPricingRuleService } from '../services/resort-pricing-rule.service';
import { ResortPricingRuleEntity } from '../entities/resort-pricing-rule.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Resort')
@Controller('resort/resort-pricing-rules')
export class ResortPricingRuleController extends BaseController<ResortPricingRuleEntity> {
  constructor(private readonly service: ResortPricingRuleService) {
    super(service);
  }
}
