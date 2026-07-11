import { Controller, Get, Param, Request } from '@nestjs/common';

@Controller('mobile/student')
export class StudentAppGatewayController {
  
  @Get('dashboard')
  async getDashboard(@Request() req: any) {
    // Aggregated response to minimize Flutter API calls, supporting offline sync.
    return {
      sync_version: 'v1.0',
      updated_at: new Date().toISOString(),
      server_timestamp: Date.now(),
      data: {
        profile: { id: req.user.id, name: 'Student Name' },
        summary: { attendance_percentage: 85, fee_due: 1500 },
        recent_activities: [],
        notifications: [],
        pending_tasks: [{ type: 'homework', title: 'Maths Chapter 5' }]
      }
    };
  }
}
