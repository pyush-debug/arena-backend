import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('institute_alumni')
export class InstituteAlumniEntity extends TenantBaseEntity {
  @Column({ name: 'student_id', type: 'int' })
  studentId: number;

  @Column({ name: 'current_company', type: 'varchar', length: 150, nullable: true })
  currentCompany: string;

  @Column({ name: 'designation', type: 'varchar', length: 100, nullable: true })
  designation: string;

  @Column({ name: 'graduation_year', type: 'int' })
  graduationYear: number;
}
