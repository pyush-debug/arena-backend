import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('homework')
export class HomeworkEntity extends TenantBaseEntity {
  @Column({ name: 'course_id', type: 'int' })
  classId: number; // Mapped from legacy course_id

  @Column({ name: 'section_id', type: 'int', nullable: true })
  sectionId: number;

  @Column({ name: 'subject_id', type: 'int', nullable: true })
  subjectId: number;

  @Column({ name: 'homework_date', type: 'date' })
  homeworkDate: Date;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'description', type: 'text' })
  description: string;
}
