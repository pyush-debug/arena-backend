import { User } from './user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'franchise_id', default: 1 })
  franchise_id: number;

  @Column('int', { name: 'user_id', nullable: true })
  user_id: number;

  @Column('varchar', { name: 'session_name', length: 50 })
  session_name: string;

  @Column('varchar', {
    name: 'status',
    length: 20,
    nullable: true,
    default: 'Active',
  })
  status: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
