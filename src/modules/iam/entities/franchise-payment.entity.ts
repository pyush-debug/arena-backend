import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../core/sdk/base/base.entity';

@Entity('franchise_payments')
export class FranchisePayment extends TenantBaseEntity {
  @Column({
    name: 'amount_paid',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
  })
  amount_paid: number;

  @Column({
    name: 'due_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
  })
  due_amount: number;

  @Column({ name: 'payment_date', type: 'date', nullable: true })
  payment_date: string | null;

  @Column({ name: 'payment_mode', type: 'varchar', length: 50, nullable: true })
  payment_mode: string | null;

  @Column({
    name: 'payment_status',
    type: 'varchar',
    length: 50,
    default: 'Success',
  })
  payment_status: string; // e.g., Pending, Success, Failed

  @Column({
    name: 'transaction_id',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  transaction_id: string | null;

  @Column({ name: 'invoice_no', type: 'varchar', length: 100, nullable: true })
  invoice_no: string | null;

  @Column({ name: 'receipt_url', type: 'varchar', length: 255, nullable: true })
  receipt_url: string | null;

  @Column({ name: 'remarks', type: 'text', nullable: true })
  remarks: string | null;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  created_by: number | null; // Admin ID who recorded it
}
