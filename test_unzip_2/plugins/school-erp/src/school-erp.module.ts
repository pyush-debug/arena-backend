import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Phase 3A Entities
import { StudentEntity } from './entities/student.entity';
import { ParentEntity } from './entities/parent.entity';
import { AdmissionEntity } from './entities/admission.entity';
import { AcademicYearEntity } from './entities/academic-year.entity';
import { ClassEntity } from './entities/class.entity';
import { SectionEntity } from './entities/section.entity';
import { SubjectEntity } from './entities/subject.entity';
import { TeacherEntity } from './entities/teacher.entity';
import { TimetableEntity } from './entities/timetable.entity';

// Phase 3B Entities
import { AttendanceEntity } from './entities/attendance.entity';
import { HomeworkEntity } from './entities/homework.entity';
import { MarkEntity } from './entities/mark.entity';
import { ReportCardEntity } from './entities/report-card.entity';

// Phase 3C Entities
import { FeePaymentEntity } from './entities/fee-payment.entity';
import { BookEntity } from './entities/book.entity';
import { VisitorEntity } from './entities/visitor.entity';

// Phase 3D Entities
import { NoticeEntity } from './entities/notice.entity';
import { NotificationEntity } from './entities/notification.entity';

// Controllers
import { StudentsController } from './modules/students/students.controller';
import { AcademicsController } from './modules/academics/academics.controller';
import { MarksController } from './modules/examinations/marks.controller';
import { FinanceController } from './modules/finance/finance.controller';
import { LibraryController } from './modules/campus/library.controller';
import { CommunicationController } from './modules/communication/communication.controller';
import { StudentAppGatewayController } from './modules/mobile/student-app.controller';
import { ParentAppGatewayController } from './modules/mobile/parent-app.controller';
import { TeacherAppGatewayController } from './modules/mobile/teacher-app.controller';
import { AnalyticsController } from './modules/analytics/analytics.controller';
import { AiInsightsController } from './modules/ai/ai-insights.controller';

// Services
import { StudentsService } from './modules/students/students.service';
import { AcademicsService } from './modules/academics/academics.service';
import { MarksService } from './modules/examinations/marks.service';
import { FinanceService } from './modules/finance/finance.service';
import { LibraryService } from './modules/campus/library.service';
import { CommunicationService } from './modules/communication/communication.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentEntity,
      ParentEntity,
      AdmissionEntity,
      AcademicYearEntity,
      ClassEntity,
      SectionEntity,
      SubjectEntity,
      TeacherEntity,
      TimetableEntity,
      AttendanceEntity,
      HomeworkEntity,
      MarkEntity,
      ReportCardEntity,
      FeePaymentEntity,
      BookEntity,
      VisitorEntity,
      NoticeEntity,
      NotificationEntity,
    ])
  ],
  controllers: [
    StudentsController,
    AcademicsController,
    MarksController,
    FinanceController,
    LibraryController,
    CommunicationController,
    StudentAppGatewayController,
    ParentAppGatewayController,
    TeacherAppGatewayController,
    AnalyticsController,
    AiInsightsController,
  ],
  providers: [
    StudentsService,
    AcademicsService,
    MarksService,
    FinanceService,
    LibraryService,
    CommunicationService,
  ],
  exports: [
    StudentsService,
  ]
})
export class SchoolErpModule {}
