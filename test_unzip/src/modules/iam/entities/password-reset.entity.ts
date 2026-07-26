import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('password_resets')
export class PasswordReset {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'email', length: 100 })
  @Index()
  email: string;

  @Column('varchar', { name: 'token', length: 255 })
  @Index()
  token: string;

  @Column('int', { name: 'franchise_id', nullable: true })
  franchise_id: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @Column('datetime', { name: 'expires_at' })
  expires_at: Date;

  @Column('boolean', { name: 'is_used', default: false })
  is_used: boolean;


  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date;
}
