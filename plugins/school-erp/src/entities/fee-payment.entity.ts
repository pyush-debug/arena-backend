import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('fee_payments')
export class FeePaymentEntity extends TenantBaseEntity {
  @Column({ name: 'student_id', type: 'int' })
  studentId: number;

  @Column({ name: 'receipt_no', type: 'varchar', length: 50 })
  receiptNo: string;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'discount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ name: 'payment_mode', type: 'varchar', length: 50 })
  paymentMode: string;

  @Column({ name: 'payment_date', type: 'date' })
  paymentDate: Date;
}
