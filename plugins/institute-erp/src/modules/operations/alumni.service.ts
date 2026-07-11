import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { BaseService } from '../../../../../src/core/sdk/base/base.service';
import { InstituteAlumniEntity } from '../../entities/institute-alumni.entity';

@Injectable()
export class AlumniService extends BaseService<InstituteAlumniEntity> {
  constructor(
    @InjectRepository(InstituteAlumniEntity)
    repository: Repository<InstituteAlumniEntity>,
    eventEmitter: EventEmitter2,
  ) {
    super(repository, eventEmitter, 'InstituteERP.Alumni');
  }

  @OnEvent('certificate.issued')
  async handleCertificateIssued(payload: any) {
    // Automatically port graduating student to Alumni Directory
    if (payload.certificateType === 'Degree') {
      const alumni = new InstituteAlumniEntity();
      alumni.studentId = payload.studentId;
      alumni.graduationYear = new Date().getFullYear();
      await this.create(payload.franchiseId, alumni);
    }
  }
}
