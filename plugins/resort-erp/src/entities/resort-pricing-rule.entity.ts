import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('resort_pricing_rules')
export class ResortPricingRuleEntity extends TenantBaseEntity {
  @Column({ name: 'room_type_id', type: 'int', nullable: true })
  roomTypeId: number;

  @Column({ name: 'rule_type', type: 'varchar', nullable: true })
  ruleType: string;

  @Column({ name: 'multiplier', type: 'int', nullable: true })
  multiplier: number;

  @Column({ name: 'start_date', type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ name: 'min_occupancy', type: 'int', nullable: true })
  minOccupancy: number;

  @Column({ name: 'is_active', type: 'boolean', nullable: true })
  isActive: boolean;

}
