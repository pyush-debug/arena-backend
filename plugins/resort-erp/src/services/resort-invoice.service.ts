import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseService } from '../../../../src/core/sdk/base/base.service';
import { ResortInvoiceEntity } from '../entities/resort-invoice.entity';

@Injectable()
export class ResortInvoiceService extends BaseService<ResortInvoiceEntity> {
  constructor(
    @InjectRepository(ResortInvoiceEntity) repository: Repository<ResortInvoiceEntity>,
    eventEmitter: EventEmitter2
  ) {
    super(repository, eventEmitter, 'Resort.ResortInvoice');
  }
}
