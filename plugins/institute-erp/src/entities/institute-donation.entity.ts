import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('institute_donations')
export class InstituteDonationEntity extends TenantBaseEntity {
  @Column({ name: 'alumni_id', type: 'int', nullable: true })
  alumniId: number;

  @Column({ name: 'amount', type: 'int', nullable: true })
  amount: number;

  @Column({ name: 'purpose', type: 'varchar', nullable: true })
  purpose: string;

}
