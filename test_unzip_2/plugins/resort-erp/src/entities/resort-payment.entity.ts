import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('resort_payments')
export class ResortPaymentEntity extends TenantBaseEntity {
  @Column({ name: 'invoice_id', type: 'int', nullable: true })
  invoiceId: number;

  @Column({ name: 'payment_method', type: 'varchar', nullable: true })
  paymentMethod: string;

  @Column({ name: 'amount', type: 'int', nullable: true })
  amount: number;

  @Column({ name: 'transaction_id', type: 'varchar', nullable: true })
  transactionId: string;

  @Column({ name: 'status', type: 'varchar', nullable: true })
  status: string;

}
