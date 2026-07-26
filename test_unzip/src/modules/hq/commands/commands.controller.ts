import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { CommandsService } from './commands.service';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard';
import { HqAdminGuard, REQUIRE_HQ_ADMIN } from '../guards/hq-admin.guard';

@Controller('hq/commands')
@UseGuards(JwtAuthGuard, HqAdminGuard)
@SetMetadata(REQUIRE_HQ_ADMIN, true)
export class CommandsController {
  constructor(private readonly commandsService: CommandsService) {}

  @Post('franchise/:id/suspend')
  async suspendFranchise(
    @Param('id') franchiseId: number,
    @Body('reason') reason: string,
  ) {
    return this.commandsService.suspendFranchise(franchiseId, reason);
  }

  @Post('franchise/:id/resume')
  async resumeFranchise(@Param('id') franchiseId: number) {
    return this.commandsService.resumeFranchise(franchiseId);
  }

  @Post('cache/clear')
  async clearPlatformCache() {
    return this.commandsService.clearCache();
  }
}
