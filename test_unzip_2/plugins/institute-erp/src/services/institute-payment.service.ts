import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseService } from '../../../../src/core/sdk/base/base.service';
import { InstitutePaymentEntity } from '../entities/institute-payment.entity';

@Injectable()
export class InstitutePaymentService extends BaseService<InstitutePaymentEntity> {
  constructor(
    @InjectRepository(InstitutePaymentEntity) repository: Repository<InstitutePaymentEntity>,
    eventEmitter: EventEmitter2
  ) {
    super(repository, eventEmitter, 'Institute.InstitutePayment');
  }
}
