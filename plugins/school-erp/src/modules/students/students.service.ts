import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '../../../../../src/core/sdk/base/base.service';
import { StudentEntity } from '../../entities/student.entity';

@Injectable()
export class StudentsService extends BaseService<StudentEntity> {
  constructor(
    @InjectRepository(StudentEntity)
    repository: Repository<StudentEntity>,
    eventEmitter: EventEmitter2,
  ) {
    super(repository, eventEmitter, 'SchoolERP.Student');
  }

  // Hook into the Base SDK lifecycle
  async afterCreate(franchiseId: number, student: StudentEntity): Promise<void> {
    // Automatically trigger notification when a student is created
    this.eventEmitter.emit('student.admitted', { franchiseId, student });
  }
}
