import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('school_timetable')
export class TimetableEntity extends TenantBaseEntity {
  @Column({ name: 'academic_year_id', type: 'int' })
  academicYearId: number;

  @Column({ name: 'section_id', type: 'int' })
  sectionId: number;

  @Column({ name: 'subject_id', type: 'int' })
  subjectId: number;

  @Column({ name: 'teacher_id', type: 'int' })
  teacherId: number;

  @Column({ name: 'day_of_week', type: 'varchar', length: 20 })
  dayOfWeek: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;
}
