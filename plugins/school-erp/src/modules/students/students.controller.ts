import { Controller } from '@nestjs/common';
import { BaseController } from '../../../../../src/core/sdk/base/base.controller';
import { StudentsService } from './students.service';
import { StudentEntity } from '../../entities/student.entity';

@Controller('students')
export class StudentsController extends BaseController<StudentEntity> {
  constructor(private readonly studentsService: StudentsService) {
    super(studentsService); // Inherits Pagination, CRUD, and strict Tenant isolation
  }
}
