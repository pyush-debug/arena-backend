import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('students')
export class StudentEntity extends TenantBaseEntity {
  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'admission_no', type: 'varchar', length: 50, nullable: true })
  admissionNo: string;

  @Column({ name: 'phone', type: 'varchar', length: 15 })
  phone: string;

  @Column({ name: 'email', type: 'text', nullable: true })
  email: string;

  @Column({ name: 'dob', type: 'date', nullable: true })
  dob: Date;

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'Active' })
  status: string;

  @Column({ name: 'course_id', type: 'int' })
  legacyCourseId: number; // For backward compatibility mapping

  @Column({ name: 'father_name', type: 'text', nullable: true })
  fatherName: string;

  @Column({ name: 'blood_group', type: 'varchar', length: 10, nullable: true })
  bloodGroup: string;
}
