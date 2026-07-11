import { Controller } from '@nestjs/common';
import { BaseController } from '../../../../src/core/sdk/base/base.controller';
import { ResortPaymentService } from '../services/resort-payment.service';
import { ResortPaymentEntity } from '../entities/resort-payment.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Resort')
@Controller('resort/resort-payments')
export class ResortPaymentController extends BaseController<ResortPaymentEntity> {
  constructor(private readonly service: ResortPaymentService) {
    super(service);
  }
}
