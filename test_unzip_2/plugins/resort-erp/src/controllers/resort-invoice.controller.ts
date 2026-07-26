import { Controller } from '@nestjs/common';
import { BaseController } from '../../../../src/core/sdk/base/base.controller';
import { ResortInvoiceService } from '../services/resort-invoice.service';
import { ResortInvoiceEntity } from '../entities/resort-invoice.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Resort')
@Controller('resort/resort-invoices')
export class ResortInvoiceController extends BaseController<ResortInvoiceEntity> {
  constructor(private readonly service: ResortInvoiceService) {
    super(service);
  }
}
