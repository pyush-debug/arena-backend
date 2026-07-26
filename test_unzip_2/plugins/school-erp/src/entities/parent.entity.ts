import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('parents')
export class ParentEntity extends TenantBaseEntity {
  @Column({ name: 'student_id', type: 'int' })
  studentId: number;

  @Column({ name: 'parent_name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'phone', type: 'varchar', length: 20 })
  phone: string;
}
