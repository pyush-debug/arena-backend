import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('institute_fees')
export class InstituteFeeEntity extends TenantBaseEntity {
  @Column({ name: 'semester_id', type: 'int', nullable: true })
  semesterId: number;

  @Column({ name: 'batch_id', type: 'int', nullable: true })
  batchId: number;

  @Column({ name: 'amount', type: 'int', nullable: true })
  amount: number;

  @Column({ name: 'description', type: 'varchar', nullable: true })
  description: string;

}
