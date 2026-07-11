import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { Admin } from '../entities/admin.entity';
import { PasswordService } from '../password/password.service';
import { SessionService } from '../session/session.service';
import { LoginDto } from './dto/login.dto';
import { CustomLoggerService } from '../../../core/logger/custom-logger.service';

export interface JwtPayload {
  sub: number;
  username: string;
  role: string;
  franchise_id: number;
  session_id: number;
  type: string;
}

import { DataSource } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly passwordService: PasswordService,
    private readonly sessionService: SessionService,
    private readonly jwtService: JwtService,
    private readonly logger: CustomLoggerService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Primary authentication method.
   * Handles user validation, lazy password migration, and token generation.
   */
  async login(
    loginDto: LoginDto,
    ipAddress: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Partial<User | Admin>;
  }> {
    const { username, password, franchise_id, device_id } = loginDto;
    this.logger.debug(`Login attempt for username: ${username}`, 'AuthService');

    let account: User | Admin | null = null;
    let accountType = 'user';

    // 1. Check Admin Table (SuperAdmins)
    account = await this.adminRepository.findOne({ where: { username } });
    if (account) {
      accountType = 'admin';
    } else {
      // 2. Check Users Table (Franchise scoped)
      const whereCondition = franchise_id 
        ? [ { username, franchise_id }, { email: username, franchise_id } ]
        : [ { username }, { email: username } ];
        
      account = await this.userRepository.findOne({
        where: whereCondition,
      });
      
      // 2.5 Check Students Table if not found in Users
      if (!account) {
        try {
          const query = franchise_id 
            ? 'SELECT * FROM students WHERE (roll_no = ? OR email = ? OR login_id = ?) AND franchise_id = ? LIMIT 1'
            : 'SELECT * FROM students WHERE (roll_no = ? OR email = ? OR login_id = ?) LIMIT 1';
          const params = franchise_id 
            ? [username, username, username, franchise_id]
            : [username, username, username];
            
          const [student] = await this.dataSource.query(query, params);
          if (student) {
            accountType = 'student';
            account = {
              id: student.id,
              username: student.roll_no || student.email,
              password: student.password,
              role: 'student',
              franchise_id: student.franchise_id,
              status: 'active'
            } as any;
          }
        } catch (e) {
          // Table might not exist or error occurred
        }
      }
    }

    if (!account) {
      this.logger.warn(`Failed login: Unknown user ${username}`, 'AuthService');
      throw new UnauthorizedException('Invalid credentials');
    }

    if (
      account.status !== 'active' &&
      account.status !== 'Active' &&
      account.status !== '1'
    ) {
      throw new ForbiddenException('Account is suspended or inactive');
    }

    // 3. Verify Password (handles legacy hashing)
    const isValid = await this.passwordService.verifyPassword(
      password,
      account.password as string,
    );
    if (!isValid) {
      this.logger.warn(
        `Failed login: Invalid password for ${username}`,
        'AuthService',
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    // 4. Lazy Password Migration to Argon2id
    if (this.passwordService.needsRehash(account.password as string)) {
      this.logger.log(
        `Migrating password for ${username} to secure hash`,
        'AuthService',
      );
      const newHash = await this.passwordService.hashPassword(password);
      if (accountType === 'admin') {
        await this.adminRepository.update(account.id, { password: newHash });
      } else {
        await this.userRepository.update(account.id, { password: newHash });
      }
    }

    // 5. Track Session
    const sessionFranchise =
      accountType === 'admin' ? 1 : ((account as User).franchise_id as number);
    const session = await this.sessionService.createSession(
      sessionFranchise,
      account.id,
      device_id || ipAddress,
    );

    // 6. Generate Tokens
    const payload = {
      sub: account.id,
      username: account.username,
      role: account.role,
      franchise_id: sessionFranchise,
      session_id: session.id,
      type: accountType,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    let franchise_logo = null;
    let branch_name = 'Arena OS';
    if (sessionFranchise) {
      const [franchiseData] = await this.dataSource.query(
        'SELECT logo, branch_name, branch_code FROM franchises WHERE id = ? LIMIT 1',
        [sessionFranchise]
      );
      if (franchiseData) {
        franchise_logo = franchiseData.logo;
        branch_name = franchiseData.branch_name || franchiseData.branch_code || 'Arena OS';
      }
    }

    return {
      accessToken,
      refreshToken,
      user: {
        id: account.id,
        username: account.username,
        role: accountType === 'admin' ? account.role : 'user',
        franchise_id: sessionFranchise,
        franchise_logo,
        branch_name,
      },
    };
  }

  refresh(refreshToken: string): {
    accessToken: string;
    refreshToken: string;
    user: { id: number; username: string; role: string; franchise_id: number };
  } {
    try {
      const decoded = this.jwtService.verify<JwtPayload>(refreshToken);
      const payload = {
        sub: decoded.sub,
        username: decoded.username,
        role: decoded.role,
        franchise_id: decoded.franchise_id,
        session_id: decoded.session_id,
        type: decoded.type,
      };

      const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
      const newRefreshToken = this.jwtService.sign(payload, {
        expiresIn: '30d',
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: decoded.sub,
          username: decoded.username,
          role: decoded.role,
          franchise_id: decoded.franchise_id,
        },
      };
    } catch (e) {
      throw new UnauthorizedException(
        `Invalid or expired refresh token: ${(e as Error).message}`,
      );
    }
  }

  async getMe(userId: number, type: string): Promise<Partial<User | Admin>> {
    let account: User | Admin | null = null;
    if (type === 'admin') {
      account = await this.adminRepository.findOne({ where: { id: userId } });
    } else if (type === 'student') {
      try {
        const [student] = await this.dataSource.query('SELECT * FROM students WHERE id = ? LIMIT 1', [userId]);
        if (student) {
          account = {
            id: student.id,
            username: student.roll_no || student.email,
            password: student.password,
            role: 'student',
            franchise_id: student.franchise_id,
            student_name: student.student_name,
            status: 'active'
          } as any;
        }
      } catch (e) {}
    } else {
      account = await this.userRepository.findOne({ where: { id: userId } });
    }

    if (!account) {
      throw new UnauthorizedException('User not found');
    }

    // Don't send password
    const { password: _password, ...safeAccount } = account;
    return safeAccount;
  }
}

