import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('institute_placement_drives')
export class InstituteDriveEntity extends TenantBaseEntity {
  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'title', type: 'varchar', nullable: true })
  title: string;

  @Column({ name: 'drive_date', type: 'timestamp', nullable: true })
  driveDate: Date;

  @Column({ name: 'min_cgpa', type: 'int', nullable: true })
  minCgpa: number;

  @Column({ name: 'max_backlogs', type: 'int', nullable: true })
  maxBacklogs: number;

  @Column({ name: 'status', type: 'varchar', nullable: true })
  status: string;

}
