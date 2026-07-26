import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('resort_ota_channels')
export class ResortOtaChannelEntity extends TenantBaseEntity {
  @Column({ name: 'channel_name', type: 'varchar', nullable: true })
  channelName: string;

  @Column({ name: 'api_key', type: 'varchar', nullable: true })
  apiKey: string;

  @Column({ name: 'status', type: 'varchar', nullable: true })
  status: string;

}
