import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseService } from '../../../../src/core/sdk/base/base.service';
import { ResortPaymentEntity } from '../entities/resort-payment.entity';

@Injectable()
export class ResortPaymentService extends BaseService<ResortPaymentEntity> {
  constructor(
    @InjectRepository(ResortPaymentEntity) repository: Repository<ResortPaymentEntity>,
    eventEmitter: EventEmitter2
  ) {
    super(repository, eventEmitter, 'Resort.ResortPayment');
  }
}
