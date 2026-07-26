import { Controller, Get, Request } from '@nestjs/common';

@Controller('analytics')
export class AnalyticsController {
  
  @Get('hq-dashboard')
  async getDashboardMetrics(@Request() req: any) {
    return {
      strength: { total: 1200, active: 1150 },
      attendance_trend: [90, 92, 88, 95], // Weekly percentages
      fee_collection: { collected: 500000, due: 50000 },
      library_usage: { issued: 120, returned: 100 }
    };
  }
}
