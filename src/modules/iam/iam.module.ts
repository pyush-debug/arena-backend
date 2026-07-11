import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { Admin } from './entities/admin.entity';
import { User } from './entities/user.entity';
import { Franchise } from './entities/franchise.entity';
import { HqFranchise } from './entities/hq-franchise.entity';
import { RolePermission } from './entities/role-permission.entity';
import { Session } from './entities/session.entity';
import { Setting } from './entities/setting.entity';
import { AuditLog } from './entities/audit-log.entity';
import { FranchiseSubscription } from './entities/franchise-subscription.entity';
import { FranchisePayment } from './entities/franchise-payment.entity';

import { AuthController } from './auth/auth.controller';
import { MeController } from './auth/me.controller';
import { AuthService } from './auth/auth.service';
import { PasswordService } from './password/password.service';
import { MfaService } from './mfa/mfa.service';
import { SessionService } from './session/session.service';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Admin,
      User,
      Franchise,
      HqFranchise,
      RolePermission,
      Session,
      Setting,
      AuditLog,
      FranchiseSubscription,
      FranchisePayment,
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('security.jwtSecret');
        if (!secret) {
          throw new Error(
            'FATAL: JWT_SECRET environment variable is not defined.',
          );
        }
        return {
          secret,
          signOptions: { expiresIn: '1h' },
        };
      },
    }),
  ],
  controllers: [AuthController, MeController],
  providers: [
    AuthService,
    PasswordService,
    MfaService,
    SessionService,
    JwtStrategy,
  ],
  exports: [AuthService, PasswordService],
})
export class IamModule {}
