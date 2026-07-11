import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('resort_ota_room_mappings')
export class ResortOtaRoomMappingEntity extends TenantBaseEntity {
  @Column({ name: 'channel_id', type: 'int', nullable: true })
  channelId: number;

  @Column({ name: 'internal_room_type_id', type: 'int', nullable: true })
  internalRoomTypeId: number;

  @Column({ name: 'ota_room_code', type: 'varchar', nullable: true })
  otaRoomCode: string;

}
