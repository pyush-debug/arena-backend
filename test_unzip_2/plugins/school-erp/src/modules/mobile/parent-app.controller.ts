import { Controller, Get, Param, Request } from '@nestjs/common';

@Controller('mobile/parent')
export class ParentAppGatewayController {
  
  @Get('dashboard')
  async getDashboard(@Request() req: any) {
    return {
      sync_version: 'v1.0',
      updated_at: new Date().toISOString(),
      server_timestamp: Date.now(),
      data: {
        profile: { id: req.user.id, name: 'Parent Name' },
        children_summary: [
          { student_id: 1, name: 'Child A', attendance: 90, fee_due: 0 }
        ],
        notifications: [],
        circulars: []
      }
    };
  }
}
