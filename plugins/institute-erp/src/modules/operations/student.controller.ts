import { Controller, Get, Post, Body, Req, Delete, Param } from '@nestjs/common';
import { StudentService } from './student.service';

@Controller('v1/institute/student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  async getAllStudents(@Req() req: any) {
    // Mimic session/branch logic: req.tenant is populated by middleware
    const branchCode = req.tenant?.id || '1';
    const search = req.query.search as string;
    const session = req.query.session as string;
    const data = await this.studentService.getAllStudents(branchCode, search, session);
    return { success: true, data };
  }

  @Post()
  async addStudent(@Req() req: any, @Body() body: any) {
    const branchCode = req.tenant?.id || '1';
    await this.studentService.addStudent(branchCode, body);
    return { success: true, message: 'Student added successfully' };
  }

  @Delete(':id')
  async deleteStudent(@Req() req: any, @Param('id') id: number) {
    const branchCode = req.tenant?.id || '1';
    await this.studentService.deleteStudent(branchCode, id);
    return { success: true, message: 'Student deleted successfully' };
  }

  @Post('dropdowns')
  async manageDropdowns(@Req() req: any, @Body() body: any) {
    const branchCode = req.tenant?.id || '1';
    return this.studentService.manageDropdowns(branchCode, body.type, body.value, body.action);
  }

  @Get('dropdowns/:type')
  async getDropdowns(@Req() req: any, @Param('type') type: string) {
    const branchCode = req.tenant?.id || '1';
    const data = await this.studentService.getDropdowns(branchCode, type);
    return { success: true, data };
  }
}
