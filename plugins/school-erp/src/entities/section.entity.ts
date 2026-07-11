import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('school_sections')
export class SectionEntity extends TenantBaseEntity {
  @Column({ name: 'class_id', type: 'int' })
  classId: number;

  @Column({ name: 'name', type: 'varchar', length: 50 })
  name: string;

  @Column({ name: 'room_number', type: 'varchar', length: 50, nullable: true })
  roomNumber: string;
}
