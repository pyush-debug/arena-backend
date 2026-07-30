import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('courses')
export class InstituteCourse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  course_name: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0.00 })
  total_fees: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0.00 })
  fees: number;

  @Column({ default: 1 })
  franchise_id: number;
}
