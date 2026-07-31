import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../src/modules/iam/auth/guards/jwt-auth.guard';
import { DataSource } from 'typeorm';
import { BaseResponse } from '../../../../src/core/sdk/base/base.response';

@ApiTags('Institute')
@Controller('institute/institute-courses')
export class InstituteCourseController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCourses(@Req() req: any) {
    const franchiseId = req.user.franchiseId;
    const isSuperAdmin = req.user.role === 'super_admin' || req.user.type === 'admin';
    let query = 'SELECT * FROM courses';
    let params: any[] = [];
    if (!isSuperAdmin && franchiseId) {
       query += ' WHERE franchise_id = ?';
       params.push(franchiseId);
    }
    query += ' ORDER BY id DESC';
    const res = await this.dataSource.query(query, params);
    return new BaseResponse(res);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createCourse(@Req() req: any, @Body() data: any) {
    const franchiseId = req.user.franchiseId;
    await this.dataSource.query(`INSERT INTO courses (course_name, fees, total_fees, franchise_id) VALUES (?, ?, ?, ?)`, [data.course_name, data.fees || 0, data.total_fees || 0, franchiseId || 0]);
    return new BaseResponse(true);
  }
  
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateCourse(@Req() req: any, @Param('id') id: number, @Body() data: any) {
    const franchiseId = req.user.franchiseId;
    const isSuperAdmin = req.user.role === 'super_admin' || req.user.type === 'admin';
    if (!isSuperAdmin && franchiseId) {
        await this.dataSource.query(`UPDATE courses SET course_name=?, fees=? WHERE id=? AND franchise_id=?`, [data.course_name, data.fees || 0, id, franchiseId]);
    } else {
        await this.dataSource.query(`UPDATE courses SET course_name=?, fees=? WHERE id=?`, [data.course_name, data.fees || 0, id]);
    }
    return new BaseResponse(true);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteCourse(@Req() req: any, @Param('id') id: number) {
    const franchiseId = req.user.franchiseId;
    const isSuperAdmin = req.user.role === 'super_admin' || req.user.type === 'admin';
    if (!isSuperAdmin && franchiseId) {
        await this.dataSource.query(`DELETE FROM courses WHERE id=? AND franchise_id=?`, [id, franchiseId]);
    } else {
        await this.dataSource.query(`DELETE FROM courses WHERE id=?`, [id]);
    }
    return new BaseResponse(true);
  }
}
