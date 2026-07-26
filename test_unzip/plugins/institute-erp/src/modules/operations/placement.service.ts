import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseService } from '../../../../../src/core/sdk/base/base.service';
import { InstitutePlacementEntity } from '../../entities/institute-placement.entity';

@Injectable()
export class PlacementService extends BaseService<InstitutePlacementEntity> {
  constructor(
    @InjectRepository(InstitutePlacementEntity)
    repository: Repository<InstitutePlacementEntity>,
    eventEmitter: EventEmitter2,
  ) {
    super(repository, eventEmitter, 'InstituteERP.Placement');
  }

  async afterCreate(franchiseId: number, placement: InstitutePlacementEntity): Promise<void> {
    if (placement.status === 'Selected') {
      this.eventEmitter.emit('placement.studentSelected', { franchiseId, placement });
    }
  }
}
