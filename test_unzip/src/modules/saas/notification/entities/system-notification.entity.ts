import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../core/sdk/base/base.entity';

@Entity('system_notifications')
export class SystemNotification extends TenantBaseEntity {
  @Column({ name: 'student_id', type: 'int', nullable: true })
  student_id: number | null;

  @Column({ name: 'type', type: 'varchar', length: 50 })
  type: string;

  @Column({ name: 'message', type: 'text' })
  message: string;

  @Column({ name: 'link', type: 'varchar', length: 255, default: '#' })
  link: string;

  @Column({ name: 'is_read', type: 'int', default: 0 })
  is_read: number;
}
