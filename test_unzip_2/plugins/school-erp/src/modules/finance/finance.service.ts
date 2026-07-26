import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseService } from '../../../../../src/core/sdk/base/base.service';
import { FeePaymentEntity } from '../../entities/fee-payment.entity';

@Injectable()
export class FinanceService extends BaseService<FeePaymentEntity> {
  constructor(
    @InjectRepository(FeePaymentEntity)
    repository: Repository<FeePaymentEntity>,
    eventEmitter: EventEmitter2,
  ) {
    super(repository, eventEmitter, 'SchoolERP.Finance');
  }

  // Hook into the Base SDK lifecycle
  async afterCreate(franchiseId: number, payment: FeePaymentEntity): Promise<void> {
    // Automatically trigger notification when a fee is collected
    this.eventEmitter.emit('fee.collected', { franchiseId, payment });
  }
}
