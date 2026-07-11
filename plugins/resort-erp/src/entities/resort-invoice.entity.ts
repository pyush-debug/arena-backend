import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('resort_invoices')
export class ResortInvoiceEntity extends TenantBaseEntity {
  @Column({ name: 'booking_id', type: 'int', nullable: true })
  bookingId: number;

  @Column({ name: 'guest_id', type: 'int', nullable: true })
  guestId: number;

  @Column({ name: 'total_amount', type: 'int', nullable: true })
  totalAmount: number;

  @Column({ name: 'tax_amount', type: 'int', nullable: true })
  taxAmount: number;

  @Column({ name: 'net_amount', type: 'int', nullable: true })
  netAmount: number;

  @Column({ name: 'status', type: 'varchar', nullable: true })
  status: string;

}
