import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('school_teachers')
export class TeacherEntity extends TenantBaseEntity {
  @Column({ name: 'user_id', type: 'int' })
  userId: number; // Links to staff/users for authentication

  @Column({ name: 'specialization', type: 'varchar', length: 255, nullable: true })
  specialization: string;

  @Column({ name: 'max_hours_per_week', type: 'int', default: 40 })
  maxHoursPerWeek: number;
}
