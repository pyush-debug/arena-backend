import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('school_visitors')
export class VisitorEntity extends TenantBaseEntity {
  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'phone', type: 'varchar', length: 20 })
  phone: string;

  @Column({ name: 'purpose', type: 'text' })
  purpose: string;

  @Column({ name: 'check_in', type: 'timestamp' })
  checkIn: Date;

  @Column({ name: 'check_out', type: 'timestamp', nullable: true })
  checkOut: Date;
}
