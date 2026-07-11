import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('institute_departments')
export class InstituteDepartmentEntity extends TenantBaseEntity {
  @Column({ name: 'name', type: 'varchar', length: 150 })
  name: string;

  @Column({ name: 'code', type: 'varchar', length: 50 })
  code: string;
}
