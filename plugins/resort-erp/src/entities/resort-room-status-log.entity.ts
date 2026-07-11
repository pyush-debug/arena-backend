import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('resort_room_status_logs')
export class ResortRoomStatusLogEntity extends TenantBaseEntity {
  @Column({ name: 'room_id', type: 'int', nullable: true })
  roomId: number;

  @Column({ name: 'status', type: 'varchar', nullable: true })
  status: string;

  @Column({ name: 'updated_by', type: 'int', nullable: true })
  updatedBy: number;

}
