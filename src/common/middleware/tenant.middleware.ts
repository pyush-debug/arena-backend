import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomLoggerService } from '../../core/logger/custom-logger.service';
import { DataSource } from 'typeorm';

export interface TenantRequest extends Request {
  franchiseId?: number;
  tenantId?: number;
  moduleId?: string;
  resolvedDomain?: string;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private readonly logger: CustomLoggerService,
    private readonly dataSource: DataSource,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    let franchiseId: number | undefined = undefined;
    let tenantId: number | undefined = undefined;
    let moduleId: string | undefined = undefined;
    const resolvedDomain =
      (req.headers['x-tenant-domain'] as string) ||
      req.headers.host ||
      req.hostname;

    // 1. JWT Extractor (Highest Priority for Security & Authenticated Users)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const payloadStr = Buffer.from(
          token.split('.')[1],
          'base64',
        ).toString();
        const payload = JSON.parse(payloadStr);
        if (payload.franchise_id) franchiseId = payload.franchise_id;
        if (payload.tenant_id) tenantId = payload.tenant_id;
        if (payload.module_id) moduleId = payload.module_id;
      } catch (e) {
        // Ignore parse errors, let Guard handle it
      }
    }

    // 2. Domain / Subdomain Extractor (For Unauthenticated Public Routes like Login/Manifest)
    if (!franchiseId && resolvedDomain) {
      try {
        // Clean port if exists
        const hostname = resolvedDomain.split(':')[0];

        // Skip for localhost during dev
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
          // Check database for matching custom domain or branch code (subdomain)
          const [franchiseData] = await this.dataSource.query(
            `SELECT id, plan_type, addon_institute_erp, addon_resort_erp FROM franchises 
             WHERE custom_domain = ? OR branch_code = ? LIMIT 1`,
            [hostname, hostname.split('.')[0]],
          );

          if (franchiseData) {
            franchiseId = franchiseData.id;
            tenantId = franchiseData.id;

            // Map the module correctly
            const plan = (franchiseData.plan_type || '').toLowerCase();
            if (franchiseData.addon_resort_erp === 1 || plan.includes('resort'))
              moduleId = 'resort';
            else if (
              franchiseData.addon_institute_erp === 1 ||
              plan.includes('institute')
            )
              moduleId = 'institute';
            else if (plan.includes('billing')) moduleId = 'billing';
            else moduleId = 'school';
          }
        }
      } catch (error) {
        this.logger.error(
          `Error resolving tenant from domain: ${error.message}`,
          error.stack,
          'TenantMiddleware',
        );
      }
    }

    // 3. Header Fallback (For manual API testing / legacy support)
    if (!franchiseId) {
      const franchiseIdHeader =
        req.headers['x-franchise-id'] || req.headers['x-tenant-id'];
      if (franchiseIdHeader) {
        const parsed = parseInt(franchiseIdHeader as string, 10);
        if (!isNaN(parsed)) {
          franchiseId = parsed;
          tenantId = parsed;
        }
      }
    }

    (req as TenantRequest).franchiseId = franchiseId;
    (req as TenantRequest).tenantId = tenantId;
    (req as TenantRequest).moduleId = moduleId;
    (req as TenantRequest).resolvedDomain = resolvedDomain;

    if (franchiseId) {
      this.logger.verbose(
        `Tenant Scope set to Franchise: ${franchiseId} | Module: ${moduleId || 'unknown'}`,
        'TenantMiddleware',
      );
    }

    next();
  }
}
