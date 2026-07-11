import {
  BaseEntity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';

export abstract class TenantBaseEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { nullable: false })
  @Index()
  franchise_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
