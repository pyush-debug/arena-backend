import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('institute_transcripts')
export class InstituteTranscriptEntity extends TenantBaseEntity {
  @Column({ name: 'student_id', type: 'int' })
  studentId: number;

  @Column({ name: 'semester_id', type: 'int' })
  semesterId: number;

  @Column({ name: 'sgpa', type: 'decimal', precision: 4, scale: 2 })
  sgpa: number;

  @Column({ name: 'cgpa', type: 'decimal', precision: 4, scale: 2 })
  cgpa: number;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished: boolean;
}
