import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

interface AuthRequest extends Request {
  user?: {
    type: string;
  };
}

export const REQUIRE_HQ_ADMIN = 'require_hq_admin';

@Injectable()
export class HqAdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_HQ_ADMIN,
      [context.getHandler(), context.getClass()],
    );

    if (!required) {
      return true; // No explicit protection requested on this route
    }

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const user = request.user;

    // Check if the authenticated user is an HQ Admin (type === 'admin')
    if (!user || user.type !== 'admin') {
      throw new ForbiddenException(
        'Access denied. HQ Enterprise Command Center strictly requires SuperAdmin privileges.',
      );
    }

    return true;
  }
}
