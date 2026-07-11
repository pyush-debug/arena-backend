import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../core/sdk/base/base.entity';

@Entity('hq_incidents')
export class HqIncidentEntity extends TenantBaseEntity {
  @Column({ name: 'title', type: 'varchar', nullable: true })
  title: string;

  @Column({ name: 'description', type: 'varchar', nullable: true })
  description: string;

  @Column({ name: 'severity', type: 'varchar', nullable: true })
  severity: string;

  @Column({ name: 'status', type: 'varchar', nullable: true })
  status: string;

  @Column({ name: 'root_cause', type: 'varchar', nullable: true })
  rootCause: string;

  @Column({ name: 'assigned_engineer_id', type: 'int', nullable: true })
  assignedEngineerId: number;

  @Column({ name: 'resolution_time', type: 'timestamp', nullable: true })
  resolutionTime: Date;
}
