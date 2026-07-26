import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('system_menus')
@Index(['module_id'])
export class SystemMenu {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'module_id', length: 50 })
  module_id: string;

  @Column('varchar', { name: 'title', length: 100 })
  title: string;

  @Column('varchar', { name: 'icon', length: 50 })
  icon: string;

  @Column('varchar', { name: 'route', length: 255 })
  route: string;

  @Column('varchar', { name: 'api_endpoint', length: 255, nullable: true })
  api_endpoint: string | null;

  @Column('simple-array', { name: 'allowed_roles' })
  allowed_roles: string[];

  @Column('int', { name: 'sort_order', default: 0 })
  sort_order: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date;
}
