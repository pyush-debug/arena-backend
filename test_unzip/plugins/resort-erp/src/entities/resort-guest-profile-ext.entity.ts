import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('resort_guest_profiles_ext')
export class ResortGuestProfileExtEntity extends TenantBaseEntity {
  @Column({ name: 'guest_id', type: 'int', nullable: true })
  guestId: number;

  @Column({ name: 'loyalty_tier', type: 'varchar', nullable: true })
  loyaltyTier: string;

  @Column({ name: 'loyalty_points', type: 'int', nullable: true })
  loyaltyPoints: number;

  @Column({ name: 'is_vip', type: 'boolean', nullable: true })
  isVip: boolean;

  @Column({ name: 'is_blacklisted', type: 'boolean', nullable: true })
  isBlacklisted: boolean;

  @Column({ name: 'corporate_company', type: 'varchar', nullable: true })
  corporateCompany: string;

  @Column({ name: 'preferences', type: 'varchar', nullable: true })
  preferences: string;

}
