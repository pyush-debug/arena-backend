import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface TenantData {
  franchiseId: number;
  status: string;
  plan: string;
}

interface TenantRequest extends Request {
  tenantContext?: TenantData;
}

/**
 * @CurrentTenant() Decorator
 * Extracts the enriched TenantContext injected by the TenantResolverInterceptor.
 */
export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TenantData => {
    const request = ctx.switchToHttp().getRequest<TenantRequest>();
    return request.tenantContext!;
  },
);
