import { Controller } from '@nestjs/common';
import { BaseController } from '../../../../../src/core/sdk/base/base.controller';
import { FinanceService } from './finance.service';
import { FeePaymentEntity } from '../../entities/fee-payment.entity';

@Controller('finance/fees')
export class FinanceController extends BaseController<FeePaymentEntity> {
  constructor(private readonly financeService: FinanceService) {
    super(financeService); // Fully tenant isolated via SDK
  }
}
