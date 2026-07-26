import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('security.jwtSecret');
    if (!secret) {
      throw new Error('FATAL: JWT_SECRET environment variable is not defined.');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload) {
    if (!payload.sub) {
      throw new UnauthorizedException();
    }
    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
      franchiseId: payload.franchise_id,
      tenantId: payload.tenant_id,
      moduleId: payload.module_id,
      sessionId: payload.session_id,
      type: payload.type,
      available_modules: payload.available_modules || [],
    };
  }
}
