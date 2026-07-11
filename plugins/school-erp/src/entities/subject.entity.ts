import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('school_subjects')
export class SubjectEntity extends TenantBaseEntity {
  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'code', type: 'varchar', length: 50, nullable: true })
  code: string;

  @Column({ name: 'is_practical', type: 'boolean', default: false })
  isPractical: boolean;
}
