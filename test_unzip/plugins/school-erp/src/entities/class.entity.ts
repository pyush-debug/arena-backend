import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('school_classes')
export class ClassEntity extends TenantBaseEntity {
  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'level', type: 'int', nullable: true })
  level: number;
}
