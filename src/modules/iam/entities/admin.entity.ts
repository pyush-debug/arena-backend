import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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
}
