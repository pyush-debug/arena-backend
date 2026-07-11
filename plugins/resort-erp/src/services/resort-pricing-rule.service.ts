import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseService } from '../../../../src/core/sdk/base/base.service';
import { ResortPricingRuleEntity } from '../entities/resort-pricing-rule.entity';

@Injectable()
export class ResortPricingRuleService extends BaseService<ResortPricingRuleEntity> {
  constructor(
    @InjectRepository(ResortPricingRuleEntity) repository: Repository<ResortPricingRuleEntity>,
    eventEmitter: EventEmitter2
  ) {
    super(repository, eventEmitter, 'Resort.ResortPricingRule');
  }
}
