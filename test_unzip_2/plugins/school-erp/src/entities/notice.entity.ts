import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('notices')
export class NoticeEntity extends TenantBaseEntity {
  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'message', type: 'text' })
  message: string;

  @Column({ name: 'notice_date', type: 'date' })
  noticeDate: Date;

  @Column({ name: 'audience', type: 'varchar', length: 50, default: 'All' })
  audience: string;
}
