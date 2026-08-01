import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../../src/modules/iam/auth/guards/jwt-auth.guard';
import { LibraryService } from './library.service';

@ApiTags('Library Desk')
@Controller('v1/institute/library')
@UseGuards(JwtAuthGuard)
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get('issues')
  @ApiOperation({ summary: 'Get active library issues' })
  async getIssues(@Req() req: any, @Query('session') session: string) {
    const branchCode = req.user.tenantId; // Assuming tenantId maps to branch_code
    return this.libraryService.getActiveIssues(branchCode, session);
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Get book inventory' })
  async getInventory(@Req() req: any) {
    const branchCode = req.user.tenantId;
    return this.libraryService.getInventory(branchCode);
  }
}
