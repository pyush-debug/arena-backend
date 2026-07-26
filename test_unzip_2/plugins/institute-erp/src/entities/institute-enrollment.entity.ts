import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('institute_enrollments')
export class InstituteEnrollmentEntity extends TenantBaseEntity {
  @Column({ name: 'student_id', type: 'int' })
  studentId: number; // Links to shared legacy students table

  @Column({ name: 'program_id', type: 'int' })
  programId: number;

  @Column({ name: 'batch_id', type: 'int' })
  batchId: number;

  @Column({ name: 'semester_id', type: 'int' })
  semesterId: number;

  @Column({ name: 'status', type: 'varchar', length: 50, default: 'Active' })
  status: string;
}
