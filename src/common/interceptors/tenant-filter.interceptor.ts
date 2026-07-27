import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TenantFilterInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TenantFilterInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const requestFranchiseId = request.franchiseId || request.tenantId;

    return next.handle().pipe(
      map((data) => {
        // Skip validation if no tenant context exists (e.g. public routes, super admin)
        if (!requestFranchiseId || requestFranchiseId === 1) {
          return data;
        }

        if (data) {
          // If it's an array of results
          if (Array.isArray(data)) {
            data.forEach((item) =>
              this.validateTenantIsolation(item, requestFranchiseId),
            );
          }
          // If it's a paginated response object (e.g. from BaseService { data: [], meta: {} })
          else if (data.data && Array.isArray(data.data)) {
            data.data.forEach((item: any) =>
              this.validateTenantIsolation(item, requestFranchiseId),
            );
          }
          // If it's a single object
          else if (typeof data === 'object') {
            this.validateTenantIsolation(data, requestFranchiseId);
          }
        }

        return data;
      }),
    );
  }

  private validateTenantIsolation(item: any, expectedFranchiseId: number) {
    if (item && item.franchise_id !== undefined && item.franchise_id !== null) {
      if (Number(item.franchise_id) !== Number(expectedFranchiseId)) {
        this.logger.error(
          `CRITICAL SECURITY ALERT: Cross-tenant data leakage detected! Record belongs to franchise ${item.franchise_id}, but request is for franchise ${expectedFranchiseId}.`,
        );
        throw new UnauthorizedException(
          'Security Error: Unauthorized access to tenant data',
        );
      }
    }
  }
}
