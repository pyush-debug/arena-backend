import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('school_report_cards')
export class ReportCardEntity extends TenantBaseEntity {
  @Column({ name: 'student_id', type: 'int' })
  studentId: number;

  @Column({ name: 'academic_year_id', type: 'int' })
  academicYearId: number;

  @Column({ name: 'term', type: 'varchar', length: 50 })
  term: string;

  @Column({ name: 'total_marks', type: 'decimal', precision: 8, scale: 2 })
  totalMarks: number;

  @Column({ name: 'obtained_marks', type: 'decimal', precision: 8, scale: 2 })
  obtainedMarks: number;

  @Column({ name: 'grade', type: 'varchar', length: 10, nullable: true })
  grade: string;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished: boolean;
}
