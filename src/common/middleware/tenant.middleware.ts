import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomLoggerService } from '../../core/logger/custom-logger.service';

interface TenantRequest extends Request {
  franchiseId?: number;
}

/**
 * Tenant Middleware
 * Extracts the Franchise ID from the JWT token or X-Franchise-ID header
 * and injects it into the request for downstream Repositories and Services.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly logger: CustomLoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // In a full implementation, this should extract franchise_id from verified JWT
    const franchiseIdHeader = req.headers['x-franchise-id'];

    if (franchiseIdHeader) {
      const franchiseId = parseInt(franchiseIdHeader as string, 10);
      if (isNaN(franchiseId)) {
        throw new UnauthorizedException('Invalid Franchise ID format');
      }
      (req as TenantRequest).franchiseId = franchiseId;
      this.logger.verbose(
        `Tenant Scope set to Franchise: ${franchiseId}`,
        'TenantMiddleware',
      );
    }

    next();
  }
}
