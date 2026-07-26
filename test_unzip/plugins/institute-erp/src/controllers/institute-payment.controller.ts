import { Controller } from '@nestjs/common';
import { BaseController } from '../../../../src/core/sdk/base/base.controller';
import { InstitutePaymentService } from '../services/institute-payment.service';
import { InstitutePaymentEntity } from '../entities/institute-payment.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Institute')
@Controller('institute/institute-payments')
export class InstitutePaymentController extends BaseController<InstitutePaymentEntity> {
  constructor(private readonly service: InstitutePaymentService) {
    super(service);
  }
}
