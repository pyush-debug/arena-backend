import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseService } from '../../../../src/core/sdk/base/base.service';
import { InstituteFeeEntity } from '../entities/institute-fee.entity';

@Injectable()
export class InstituteFeeService extends BaseService<InstituteFeeEntity> {
  constructor(
    @InjectRepository(InstituteFeeEntity) repository: Repository<InstituteFeeEntity>,
    eventEmitter: EventEmitter2
  ) {
    super(repository, eventEmitter, 'Institute.InstituteFee');
  }
}
