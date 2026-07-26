import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('student_notifications')
export class NotificationEntity extends TenantBaseEntity {
  @Column({ name: 'student_id', type: 'int', nullable: true })
  studentId: number;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'message', type: 'text' })
  message: string;

  @Column({ name: 'is_read', type: 'int', default: 0 })
  isRead: number;
}
