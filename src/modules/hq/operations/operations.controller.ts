import { Controller, Get, UseGuards, SetMetadata } from '@nestjs/common';
import { OperationsService } from './operations.service';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard';
import { HqAdminGuard, REQUIRE_HQ_ADMIN } from '../guards/hq-admin.guard';

@Controller('hq/operations')
@UseGuards(JwtAuthGuard, HqAdminGuard)
@SetMetadata(REQUIRE_HQ_ADMIN, true)
export class OperationsController {
  constructor(private readonly opsService: OperationsService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.opsService.getDashboardMetrics();
  }
}
