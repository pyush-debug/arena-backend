import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'franchise_id', default: 1 })
  franchise_id: number;

  @Column('varchar', { name: 'session_name', length: 50 })
  session_name: string;

  @Column('varchar', {
    name: 'status',
    length: 20,
    nullable: true,
    default: 'Active',
  })
  status: string | null;
}
