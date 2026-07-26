import { Controller, Get, Param, Request } from '@nestjs/common';

@Controller('mobile/teacher')
export class TeacherAppGatewayController {
  
  @Get('dashboard')
  async getDashboard(@Request() req: any) {
    return {
      sync_version: 'v1.0',
      updated_at: new Date().toISOString(),
      server_timestamp: Date.now(),
      data: {
        profile: { id: req.user.id, name: 'Teacher Name' },
        schedule: [
          { time: '09:00 AM', class: 'Class 10 A', subject: 'Maths' }
        ],
        pending_tasks: [
          { action: 'mark_attendance', target: 'Class 10 A' }
        ],
        notifications: []
      }
    };
  }
}
