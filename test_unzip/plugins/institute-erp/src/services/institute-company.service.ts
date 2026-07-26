import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseService } from '../../../../src/core/sdk/base/base.service';
import { InstituteCompanyEntity } from '../entities/institute-company.entity';

@Injectable()
export class InstituteCompanyService extends BaseService<InstituteCompanyEntity> {
  constructor(
    @InjectRepository(InstituteCompanyEntity) repository: Repository<InstituteCompanyEntity>,
    eventEmitter: EventEmitter2
  ) {
    super(repository, eventEmitter, 'Institute.InstituteCompany');
  }
}
