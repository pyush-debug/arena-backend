import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('system_widgets')
@Index(['module_id'])
export class SystemWidget {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'module_id', length: 50 })
  module_id: string;

  @Column('varchar', { name: 'type', length: 50 })
  type: string; // 'kpi_grid', 'bar_chart', 'list'

  @Column('varchar', { name: 'title', length: 100 })
  title: string;

  @Column('varchar', { name: 'api_endpoint', length: 255 })
  api_endpoint: string;

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
