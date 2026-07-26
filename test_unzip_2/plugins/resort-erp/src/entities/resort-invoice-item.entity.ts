import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('resort_invoice_items')
export class ResortInvoiceItemEntity extends TenantBaseEntity {
  @Column({ name: 'invoice_id', type: 'int', nullable: true })
  invoiceId: number;

  @Column({ name: 'charge_type', type: 'varchar', nullable: true })
  chargeType: string;

  @Column({ name: 'amount', type: 'int', nullable: true })
  amount: number;

  @Column({ name: 'tax_rate', type: 'int', nullable: true })
  taxRate: number;

  @Column({ name: 'description', type: 'varchar', nullable: true })
  description: string;

}
