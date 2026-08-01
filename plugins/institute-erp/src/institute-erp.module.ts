import { InstituteCourseService } from './services/institute-course.service';
import { InstituteCourseController } from './controllers/institute-course.controller';
import { InstituteCourse } from './entities/institute-course.entity';
import { InstituteDonationService } from './services/institute-donation.service';
import { InstituteSkillService } from './services/institute-skill.service';
import { InstituteDriveService } from './services/institute-drive.service';
import { InstituteCompanyService } from './services/institute-company.service';
import { InstitutePaymentService } from './services/institute-payment.service';
import { InstituteFeeService } from './services/institute-fee.service';
import { InstituteDonationController } from './controllers/institute-donation.controller';
import { InstituteSkillController } from './controllers/institute-skill.controller';
import { InstituteDriveController } from './controllers/institute-drive.controller';
import { InstituteCompanyController } from './controllers/institute-company.controller';
import { InstitutePaymentController } from './controllers/institute-payment.controller';
import { InstituteFeeController } from './controllers/institute-fee.controller';
import { InstituteDonationEntity } from './entities/institute-donation.entity';
import { InstituteSkillEntity } from './entities/institute-skill.entity';
import { InstituteDriveEntity } from './entities/institute-drive.entity';
import { InstituteCompanyEntity } from './entities/institute-company.entity';
import { InstitutePaymentEntity } from './entities/institute-payment.entity';
import { InstituteFeeEntity } from './entities/institute-fee.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { InstituteDepartmentEntity } from './entities/institute-department.entity';
import { InstituteBatchEntity } from './entities/institute-batch.entity';
import { InstituteEnrollmentEntity } from './entities/institute-enrollment.entity';
import { InstituteExamEntity } from './entities/institute-exam.entity';
import { InstituteTranscriptEntity } from './entities/institute-transcript.entity';
import { InstitutePlacementEntity } from './entities/institute-placement.entity';
import { InstituteAlumniEntity } from './entities/institute-alumni.entity';

// Modules & Controllers
import { AcademicsController } from './modules/academics/academics.controller';
import { AcademicsService } from './modules/academics/academics.service';
import { InstituteExaminationsController } from './modules/examinations/examinations.controller';
import { InstituteExaminationsService } from './modules/examinations/examinations.service';
import { PlacementController } from './modules/operations/placement.controller';
import { PlacementService } from './modules/operations/placement.service';
import { AlumniController } from './modules/operations/alumni.controller';
import { AlumniService } from './modules/operations/alumni.service';
import { DashboardController } from './modules/dashboard/dashboard.controller';
import { DashboardService } from './modules/dashboard/dashboard.service';
import { LibraryController } from './modules/operations/library.controller';
import { LibraryService } from './modules/operations/library.service';
import { StaffController } from './modules/operations/staff.controller';
import { StaffService } from './modules/operations/staff.service';
import { StudentController } from './modules/operations/student.controller';
import { StudentService } from './modules/operations/student.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InstituteCourse,
      InstituteDepartmentEntity,
      InstituteBatchEntity,
      InstituteEnrollmentEntity,
      InstituteExamEntity,
      InstituteTranscriptEntity,
      InstitutePlacementEntity,
      InstituteAlumniEntity,
      InstituteFeeEntity,
      InstitutePaymentEntity,
      InstituteCompanyEntity,
      InstituteDriveEntity,
      InstituteSkillEntity,
      InstituteDonationEntity
    ])
  ],
  controllers: [
    AcademicsController,
    InstituteExaminationsController,
    PlacementController,
    AlumniController,
    InstituteFeeController,
    InstitutePaymentController,
    InstituteCompanyController,
    InstituteDriveController,
    InstituteSkillController,
    InstituteCourseController,
    InstituteDonationController,
    DashboardController,
    LibraryController,
    StaffController,
    StudentController,
  ],
  providers: [
    AcademicsService,
    InstituteExaminationsService,
    PlacementService,
    AlumniService,
    InstituteFeeService,
    InstitutePaymentService,
    InstituteCompanyService,
    InstituteDriveService,
    InstituteSkillService,
    InstituteCourseService,
    InstituteDonationService,
    DashboardService,
    LibraryService,
    StaffService,
    StudentService,
  ],
  exports: [
    AcademicsService,
  ]
})
export class InstituteErpModule {}
