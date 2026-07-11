import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('resort_audit_logs')
@Index(['franchise_id'])
export class AuditLog {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'franchise_id', default: 1 })
  franchise_id: number;

  @Column('int', { name: 'user_id' })
  user_id: number;

  @Column('varchar', { name: 'user_name', length: 100 })
  user_name: string;

  @Column('varchar', { name: 'role', length: 50 })
  role: string;

  @Column('varchar', { name: 'action', length: 255 })
  action: string;

  @Column('varchar', { name: 'module', length: 50 })
  module: string;

  @Column('text', { name: 'details', nullable: true })
  details: string | null;

  @Column('timestamp', {
    name: 'created_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date | null;
}
