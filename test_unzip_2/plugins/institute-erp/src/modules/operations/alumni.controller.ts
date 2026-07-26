import { Controller } from '@nestjs/common';
import { BaseController } from '../../../../../src/core/sdk/base/base.controller';
import { AlumniService } from './alumni.service';
import { InstituteAlumniEntity } from '../../entities/institute-alumni.entity';

@Controller('institute/operations/alumni')
export class AlumniController extends BaseController<InstituteAlumniEntity> {
  constructor(private readonly alumniService: AlumniService) {
    super(alumniService);
  }
}
