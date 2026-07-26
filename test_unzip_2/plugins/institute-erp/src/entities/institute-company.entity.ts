import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('institute_companies')
export class InstituteCompanyEntity extends TenantBaseEntity {
  @Column({ name: 'name', type: 'varchar', nullable: true })
  name: string;

  @Column({ name: 'hr_contact', type: 'varchar', nullable: true })
  hrContact: string;

  @Column({ name: 'email', type: 'varchar', nullable: true })
  email: string;

  @Column({ name: 'industry', type: 'varchar', nullable: true })
  industry: string;

}
