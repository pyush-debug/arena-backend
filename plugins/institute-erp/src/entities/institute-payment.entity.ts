import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('institute_payments')
export class InstitutePaymentEntity extends TenantBaseEntity {
  @Column({ name: 'student_id', type: 'int', nullable: true })
  studentId: number;

  @Column({ name: 'fee_id', type: 'int', nullable: true })
  feeId: number;

  @Column({ name: 'amount_paid', type: 'int', nullable: true })
  amountPaid: number;

  @Column({ name: 'status', type: 'varchar', nullable: true })
  status: string;

}
