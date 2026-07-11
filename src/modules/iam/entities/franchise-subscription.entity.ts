import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../core/sdk/base/base.entity';

@Entity('franchise_subscriptions')
export class FranchiseSubscription extends TenantBaseEntity {
  @Column({ name: 'plan_name', type: 'varchar', length: 150 })
  plan_name: string;

  @Column({
    name: 'billing_cycle',
    type: 'varchar',
    length: 50,
    default: 'Monthly',
  })
  billing_cycle: string;

  @Column({
    name: 'amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
  })
  amount: number;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  start_date: string | null;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  end_date: string | null;

  @Column({ name: 'status', type: 'varchar', length: 50, default: 'Active' })
  status: string;
}
