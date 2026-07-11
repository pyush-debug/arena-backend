import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseService } from '../../../../src/core/sdk/base/base.service';
import { ResortInvoiceItemEntity } from '../entities/resort-invoice-item.entity';

@Injectable()
export class ResortInvoiceItemService extends BaseService<ResortInvoiceItemEntity> {
  constructor(
    @InjectRepository(ResortInvoiceItemEntity) repository: Repository<ResortInvoiceItemEntity>,
    eventEmitter: EventEmitter2
  ) {
    super(repository, eventEmitter, 'Resort.ResortInvoiceItem');
  }
}
