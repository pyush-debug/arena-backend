import { Controller, Get, Req, UseGuards, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard';
import { StudentService } from './student.service';
import type { Request } from 'express';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Controller('v1/student')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(
    private readonly studentService: StudentService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  @Get('dashboard')
  async getDashboard(@Req() req: Request) {
    const user = req.user as any;
    
    // STRICT ISOLATION: Only allow users with type 'student' to access this API
    if (user.type !== 'student') {
      throw new HttpException('Only students can access this portal', HttpStatus.FORBIDDEN);
    }

    const studentId = user.userId;
    const franchiseId = user.franchiseId;

    // Cache key specific to this student to prevent cross-data leakage
    const cacheKey = `student_dashboard_${franchiseId}_${studentId}`;
    
    // Check Redis Cache
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return { success: true, data: cachedData, source: 'cache' };
    }

    // Fetch from Database
    const data = await this.studentService.getDashboard(studentId, franchiseId);
    
    // Store in Cache for 5 minutes (300000ms)
    await this.cacheManager.set(cacheKey, data, 300000);

    return { success: true, data, source: 'database' };
  }

  @Get('attendance')
  async getAttendance(@Req() req: Request) {
    const user = req.user as any;
    if (user.type !== 'student') throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    
    const data = await this.studentService.getAttendance(user.userId, user.franchiseId);
    return { success: true, data };
  }

  @Get('fees')
  async getFees(@Req() req: Request) {
    const user = req.user as any;
    if (user.type !== 'student') throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    
    const data = await this.studentService.getFees(user.userId, user.franchiseId);
    return { success: true, data };
  }
}
