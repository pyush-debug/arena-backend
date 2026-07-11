import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseService } from '../../../../src/core/sdk/base/base.service';
import { InstituteDonationEntity } from '../entities/institute-donation.entity';

@Injectable()
export class InstituteDonationService extends BaseService<InstituteDonationEntity> {
  constructor(
    @InjectRepository(InstituteDonationEntity) repository: Repository<InstituteDonationEntity>,
    eventEmitter: EventEmitter2
  ) {
    super(repository, eventEmitter, 'Institute.InstituteDonation');
  }
}
