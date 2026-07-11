import {
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BaseService } from './base.service';
import { BaseResponse } from './base.response';
import { CurrentTenant } from '../../../modules/saas/tenant/tenant.context';
import type { TenantData } from '../../../modules/saas/tenant/tenant.context';
import { JwtAuthGuard } from '../../../modules/iam/auth/guards/jwt-auth.guard';

/**
 * Base Controller providing fully managed `/search`, CRUD, and Export endpoints
 * strictly scoped to `@CurrentTenant()`.
 */
import { TenantBaseEntity } from './base.entity';

@UseGuards(JwtAuthGuard)
export abstract class BaseController<T extends TenantBaseEntity> {
  constructor(protected readonly baseService: BaseService<T>) {}

  @Get()
  async findAll(
    @CurrentTenant() tenant: TenantData,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const result = await this.baseService.findAll(
      tenant.franchiseId,
      page,
      limit,
    );
    return new BaseResponse(result.data, 'Fetched successfully', result.meta);
  }

  @Get(':id')
  async findOne(@CurrentTenant() tenant: TenantData, @Param('id') id: number) {
    const result = await this.baseService.findOne(tenant.franchiseId, id);
    return new BaseResponse(result);
  }

  @Post()
  async create(@CurrentTenant() tenant: TenantData, @Body() dto: Partial<T>) {
    const result = await this.baseService.create(tenant.franchiseId, dto);
    return new BaseResponse(result, 'Created successfully');
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenant: TenantData,
    @Param('id') id: number,
    @Body() dto: Partial<T>,
  ) {
    const result = await this.baseService.update(tenant.franchiseId, id, dto);
    return new BaseResponse(result, 'Updated successfully');
  }

  @Delete(':id')
  async remove(@CurrentTenant() tenant: TenantData, @Param('id') id: number) {
    await this.baseService.remove(tenant.franchiseId, id);
    return new BaseResponse(null, 'Deleted successfully');
  }
}
