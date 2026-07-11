import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('role_permissions')
export class RolePermission {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'franchise_id', default: 1 })
  franchise_id: number;

  @Column('varchar', { name: 'role_name', length: 50 })
  role_name: string;

  @Column('varchar', { name: 'module_name', length: 50 })
  module_name: string;

  @Column('int', { name: 'is_allowed', default: 0 })
  is_allowed: number;
}
