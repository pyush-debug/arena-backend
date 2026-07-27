import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('admin')
export class Admin {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'username', length: 50 })
  username: string;

  @Column('varchar', { name: 'password', length: 255 })
  password: string;

  @Column('varchar', {
    name: 'role',
    length: 50,
    nullable: true,
    default: 'Admin',
  })
  role: string | null;

  @Column('varchar', { name: 'status', length: 50, default: 'active' })
  status: string;

  @Column('varchar', { name: 'name', length: 255, nullable: true })
  name: string | null;

  @Column('varchar', { name: 'email', length: 100, nullable: true })
  email: string | null;

  @Column('varchar', { name: 'phone', length: 20, nullable: true })
  phone: string | null;

  @Column('varchar', { name: 'photo', length: 255, nullable: true })
  photo: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date;
}
