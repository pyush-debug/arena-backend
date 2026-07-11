import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('marks')
export class MarkEntity extends TenantBaseEntity {
  @Column({ name: 'student_id', type: 'int' })
  studentId: number;

  @Column({ name: 'exam_id', type: 'int' })
  examId: number;

  @Column({ name: 'subject_id', type: 'int', nullable: true })
  subjectId: number;

  @Column({ name: 'obtained_marks', type: 'int' })
  obtainedMarks: number;

  @Column({ name: 'total_marks', type: 'int' })
  totalMarks: number;
}
