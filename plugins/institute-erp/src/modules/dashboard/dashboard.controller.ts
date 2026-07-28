import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../../../../src/modules/iam/auth/guards/jwt-auth.guard';

@ApiTags('Institute Dashboard')
@Controller('institute/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get Dashboard Overview Data' })
  @ApiResponse({ status: 200, description: 'Overview data returned successfully.' })
  async getOverview(@Req() req: any) {
    const franchiseId = req.user.franchiseId;
    const isSuperAdmin = franchiseId === 1; // Basic check for super admin
    
    return await this.dashboardService.getOverviewData(franchiseId, isSuperAdmin);
  }
}
