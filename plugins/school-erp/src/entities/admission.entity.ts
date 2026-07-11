import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('admission_requests')
export class AdmissionEntity extends TenantBaseEntity {
  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'phone', type: 'varchar', length: 15 })
  phone: string;

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'Pending' })
  status: string;

  @Column({ name: 'course_id', type: 'int' })
  requestedClassId: number;
}
