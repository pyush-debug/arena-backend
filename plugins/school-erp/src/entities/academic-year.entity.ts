import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('school_academic_years')
export class AcademicYearEntity extends TenantBaseEntity {
  @Column({ name: 'name', type: 'varchar', length: 50 })
  name: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive: boolean;
}
