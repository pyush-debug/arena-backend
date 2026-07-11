import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('attendance')
export class AttendanceEntity extends TenantBaseEntity {
  @Column({ name: 'student_id', type: 'int' })
  studentId: number;

  @Column({ name: 'attendance_date', type: 'date' })
  attendanceDate: Date;

  @Column({ name: 'status', type: 'varchar', length: 15 })
  status: string;

  @Column({ name: 'academic_year_id', type: 'int', nullable: true })
  academicYearId: number;
}
