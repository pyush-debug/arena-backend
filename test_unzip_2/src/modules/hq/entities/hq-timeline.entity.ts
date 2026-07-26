import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../core/sdk/base/base.entity';

@Entity('hq_timeline')
export class HqTimelineEntity extends TenantBaseEntity {
  @Column({ name: 'event_type', type: 'varchar', nullable: true })
  eventType: string;

  @Column({ name: 'description', type: 'varchar', nullable: true })
  description: string;

  @Column({ name: 'plugin_id', type: 'varchar', nullable: true })
  pluginId: string;

  @Column({ name: 'admin_id', type: 'int', nullable: true })
  adminId: number;

  @Column({ name: 'metadata', type: 'varchar', nullable: true })
  metadata: string;
}
