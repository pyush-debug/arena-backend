import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { RevenueService } from './revenue.service';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AddSubscriptionDto, AddPaymentDto } from './revenue.dto';

@ApiTags('HQ Revenue & Billing')
@ApiBearerAuth()
@Controller('hq/revenue')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  @ApiOperation({ summary: 'Get HQ Revenue Dashboard Metrics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard metrics retrieved successfully',
  })
  @Get('dashboard')
  @Roles('Super Admin', 'HQ Admin', 'Finance Manager')
  async getDashboard() {
    return this.revenueService.getRevenueDashboards();
  }

  @ApiOperation({ summary: 'Trigger Manual Billing Sync' })
  @Post('sync-billing')
  @Roles('Super Admin', 'HQ Admin', 'Finance Manager')
  async syncBillingEngine() {
    return this.revenueService.syncBillingEngine();
  }

  @ApiOperation({ summary: 'Add Franchise Subscription' })
  @Post('subscriptions')
  @Roles('Super Admin', 'HQ Admin', 'Finance Manager')
  async addSubscription(@Body() data: AddSubscriptionDto) {
    return this.revenueService.addSubscription(data);
  }

  @ApiOperation({ summary: 'Add Franchise Payment' })
  @Post('payments')
  @Roles('Super Admin', 'HQ Admin', 'Finance Manager')
  async addPayment(
    @Body() data: AddPaymentDto,
    @CurrentUser() user: { id: number; franchise_id: number },
  ) {
    data.created_by = user?.id;
    return this.revenueService.addPayment(data);
  }

  @ApiOperation({ summary: 'Get Franchise Billing Data' })
  @Get('my-billing')
  async getMyBilling(
    @CurrentUser() user: { id: number; franchise_id: number },
  ) {
    // Restricted to franchise user reading their own info
    return this.revenueService.getFranchiseBilling(user?.franchise_id);
  }

  @ApiOperation({ summary: 'Send Panel Alert to Franchise(s)' })
  @Post('notifications/send')
  @Roles('Super Admin', 'HQ Admin')
  async sendPanelAlert(
    @Body() data: { franchiseId?: number; message: string; type?: string },
  ) {
    if (data.franchiseId) {
      return this.revenueService.sendPanelAlert(
        data.franchiseId,
        data.message,
        data.type,
      );
    } else {
      return this.revenueService.broadcastPanelAlert(data.message, data.type);
    }
  }

  @ApiOperation({ summary: 'Export Revenue Data' })
  @Get('export/:type')
  @Roles('Super Admin', 'HQ Admin', 'Finance Manager')
  async exportRevenue(@Param('type') type: string) {
    // Basic implementation for CSV/PDF/Excel JSON-based export
    return this.revenueService.exportRevenueData(type);
  }
}
