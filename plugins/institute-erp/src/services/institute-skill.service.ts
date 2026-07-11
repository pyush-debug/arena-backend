import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseService } from '../../../../src/core/sdk/base/base.service';
import { InstituteSkillEntity } from '../entities/institute-skill.entity';

@Injectable()
export class InstituteSkillService extends BaseService<InstituteSkillEntity> {
  constructor(
    @InjectRepository(InstituteSkillEntity) repository: Repository<InstituteSkillEntity>,
    eventEmitter: EventEmitter2
  ) {
    super(repository, eventEmitter, 'Institute.InstituteSkill');
  }
}
