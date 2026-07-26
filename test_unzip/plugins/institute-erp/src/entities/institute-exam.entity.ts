import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('institute_exams')
export class InstituteExamEntity extends TenantBaseEntity {
  @Column({ name: 'semester_id', type: 'int' })
  semesterId: number;

  @Column({ name: 'batch_id', type: 'int' })
  batchId: number;

  @Column({ name: 'name', type: 'varchar', length: 150 })
  name: string;

  @Column({ name: 'type', type: 'varchar', length: 50, default: 'End Semester' })
  type: string;
}
