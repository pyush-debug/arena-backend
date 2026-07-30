import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('courses')
export class InstituteCourse extends TenantBaseEntity {

  @Column({ length: 100 })
  course_name: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0.00 })
  total_fees: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0.00 })
  fees: number;

}
