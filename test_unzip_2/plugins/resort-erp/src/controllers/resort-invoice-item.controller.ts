import { Controller } from '@nestjs/common';
import { BaseController } from '../../../../src/core/sdk/base/base.controller';
import { ResortInvoiceItemService } from '../services/resort-invoice-item.service';
import { ResortInvoiceItemEntity } from '../entities/resort-invoice-item.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Resort')
@Controller('resort/resort-invoice-items')
export class ResortInvoiceItemController extends BaseController<ResortInvoiceItemEntity> {
  constructor(private readonly service: ResortInvoiceItemService) {
    super(service);
  }
}
