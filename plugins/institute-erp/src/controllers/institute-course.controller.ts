import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../src/modules/iam/auth/guards/jwt-auth.guard';
import { InstituteCourseService } from '../services/institute-course.service';
import { BaseResponse } from '../../../../src/core/sdk/base/base.response';

@ApiTags('Institute')
@Controller('institute/institute-courses')
export class InstituteCourseController {
  constructor(private readonly service: InstituteCourseService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCourses() {
    const res = await this.service.getRepository().query('SELECT * FROM courses ORDER BY id DESC');
    return new BaseResponse(res);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createCourse(@Body() data: any) {
    await this.service.getRepository().query(`INSERT INTO courses (course_name, fees, total_fees) VALUES (?, ?, ?)`, [data.course_name, data.fees || 0, data.total_fees || 0]);
    return new BaseResponse(true);
  }
  
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateCourse(@Param('id') id: number, @Body() data: any) {
    await this.service.getRepository().query(`UPDATE courses SET course_name=?, fees=? WHERE id=?`, [data.course_name, data.fees || 0, id]);
    return new BaseResponse(true);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteCourse(@Param('id') id: number) {
    await this.service.getRepository().query(`DELETE FROM courses WHERE id=?`, [id]);
    return new BaseResponse(true);
  }
}
