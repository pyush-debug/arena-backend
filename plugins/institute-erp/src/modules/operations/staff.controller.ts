import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../../../../../src/modules/iam/auth/guards/jwt-auth.guard';
import { StaffService } from './staff.service';

@Controller('v1/institute/staff')
@UseGuards(JwtAuthGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  async getAllStaff(@Query('session') session: string, @Query('branchCode') branchCode: string = '1') {
    return { data: await this.staffService.getAllStaff(branchCode, session) };
  }

  @Post()
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: './uploads/staff',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      },
    }),
  }))
  async addStaff(
    @Body() data: any,
    @UploadedFile() file: Express.Multer.File,
    @Query('branchCode') branchCode: string = '1'
  ) {
    const photoName = file ? file.filename : '';
    return this.staffService.addStaff(branchCode, data, photoName);
  }

  @Patch(':id')
  async updateStaff(
    @Param('id') id: string,
    @Body() data: any,
    @Query('branchCode') branchCode: string = '1'
  ) {
    return this.staffService.updateStaff(branchCode, parseInt(id, 10), data);
  }

  @Delete(':id')
  async deleteStaff(
    @Param('id') id: string,
    @Query('branchCode') branchCode: string = '1'
  ) {
    return this.staffService.deleteStaff(branchCode, parseInt(id, 10));
  }

  @Post(':id/generate-login')
  async generateLogin(
    @Param('id') id: string,
    @Query('branchCode') branchCode: string = '1'
  ) {
    return this.staffService.generateLogin(branchCode, parseInt(id, 10));
  }

  @Get('attendance')
  async getAttendance(
    @Query('date') date: string,
    @Query('branchCode') branchCode: string = '1'
  ) {
    if (!date) {
      date = new Date().toISOString().split('T')[0];
    }
    return { data: await this.staffService.getAttendance(branchCode, date) };
  }

  @Post('attendance')
  async markAttendance(
    @Query('date') date: string,
    @Body('attendanceData') attendanceData: any[],
    @Query('branchCode') branchCode: string = '1'
  ) {
    return this.staffService.markAttendance(branchCode, date, attendanceData);
  }

  @Get('attendance/report')
  async getAttendanceReport(
    @Query('month') month: string,
    @Query('year') year: string,
    @Query('branchCode') branchCode: string = '1'
  ) {
    return { data: await this.staffService.getAttendanceReport(branchCode, month, year) };
  }

  @Post('salary')
  async generateSalary(
    @Body() data: any,
    @Query('branchCode') branchCode: string = '1'
  ) {
    return this.staffService.generateSalary(branchCode, data);
  }

  @Get('salary')
  async getSalaryHistory(
    @Query('staffId') staffId: string,
    @Query('branchCode') branchCode: string = '1'
  ) {
    const id = staffId ? parseInt(staffId, 10) : undefined;
    return { data: await this.staffService.getSalaryHistory(branchCode, id) };
  }
}
