import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', {
    name: 'institute_name',
    length: 255,
    nullable: true,
    default: 'ICT COMPUTER EDUCATION',
  })
  institute_name: string | null;

  @Column('varchar', {
    name: 'tagline',
    length: 255,
    nullable: true,
    default: 'An ISO Certified Institute',
  })
  tagline: string | null;

  @Column('varchar', { name: 'phone', length: 50, nullable: true })
  phone: string | null;

  @Column('varchar', { name: 'email', length: 100, nullable: true })
  email: string | null;

  @Column('text', { name: 'address', nullable: true })
  address: string | null;

  @Column('varchar', { name: 'website', length: 100, nullable: true })
  website: string | null;

  @Column('varchar', {
    name: 'id_prefix',
    length: 10,
    nullable: true,
    default: 'ICT-',
  })
  id_prefix: string | null;

  @Column('int', { name: 'fee_alert_limit', nullable: true, default: 1000 })
  fee_alert_limit: number | null;

  @Column('int', { name: 'att_alert_limit', nullable: true, default: 75 })
  att_alert_limit: number | null;
}
