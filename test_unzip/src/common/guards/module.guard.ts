import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ModuleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredModule = this.reflector.get<string>('module', context.getHandler());
    if (!requiredModule) {
      return true; // No module restriction on this endpoint
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.moduleId) {
      throw new ForbiddenException('Access denied: Tenant module context missing.');
    }

    // HQ users have global access, or strict module match
    if (user.moduleId === 'hq' || user.moduleId === requiredModule) {
      return true;
    }

    throw new ForbiddenException(`Access denied: This endpoint is restricted to the '${requiredModule}' module. Your current module is '${user.moduleId}'.`);
  }
}
