import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('institute_skills')
export class InstituteSkillEntity extends TenantBaseEntity {
  @Column({ name: 'student_id', type: 'int', nullable: true })
  studentId: number;

  @Column({ name: 'skill_name', type: 'varchar', nullable: true })
  skillName: string;

  @Column({ name: 'proficiency', type: 'varchar', nullable: true })
  proficiency: string;

}
