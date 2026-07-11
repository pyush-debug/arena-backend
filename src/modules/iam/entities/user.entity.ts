import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('users')
@Index(['franchise_id'])
export class User {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'franchise_id', nullable: true, default: 1 })
  franchise_id: number | null;

  @Column('varchar', { name: 'username', length: 50 })
  username: string;

  @Column('varchar', { name: 'password', length: 255, nullable: true })
  password: string | null;

  @Column('varchar', { name: 'name', length: 100 })
  name: string;

  @Column('varchar', { name: 'role', length: 20 })
  role: string;

  @Column('varchar', { name: 'photo', length: 255, nullable: true })
  photo: string | null;

  @Column('varchar', { name: 'phone', length: 20, nullable: true })
  phone: string | null;

  @Column('varchar', { name: 'email', length: 100, nullable: true })
  email: string | null;

  @Column('varchar', {
    name: 'status',
    length: 50,
    nullable: true,
    default: 'Active',
  })
  status: string | null;

  @Column('varchar', { name: 'profile_pic', length: 255, nullable: true })
  profile_pic: string | null;

  @Column('text', { name: 'address', nullable: true })
  address: string | null;
}
