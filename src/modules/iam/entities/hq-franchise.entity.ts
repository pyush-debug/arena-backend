import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('hq_franchises')
export class HqFranchise {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'franchise_id', length: 50 })
  franchise_id: string;

  @Column('varchar', { name: 'type' })
  type: 'Institute' | 'School' | 'Resort';

  @Column('varchar', { name: 'name', length: 150 })
  name: string;

  @Column('varchar', { name: 'owner_name', length: 100 })
  owner_name: string;

  @Column('varchar', { name: 'phone', length: 20 })
  phone: string;

  @Column('varchar', { name: 'added_by_role', length: 50 })
  added_by_role: string;

  @Column('int', { name: 'added_by_id' })
  added_by_id: number;

  @Column('varchar', { name: 'status', nullable: true, default: 'Active' })
  status: 'Active' | 'Suspended' | 'Pending' | null;

  @Column('timestamp', {
    name: 'created_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date | null;
}
