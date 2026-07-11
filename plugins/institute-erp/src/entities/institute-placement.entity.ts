import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('institute_placements')
export class InstitutePlacementEntity extends TenantBaseEntity {
  @Column({ name: 'student_id', type: 'int' })
  studentId: number;

  @Column({ name: 'drive_id', type: 'int' })
  driveId: number;

  @Column({ name: 'status', type: 'varchar', length: 50, default: 'Selected' })
  status: string;

  @Column({ name: 'package_lpa', type: 'decimal', precision: 5, scale: 2, nullable: true })
  packageLpa: number;
}
