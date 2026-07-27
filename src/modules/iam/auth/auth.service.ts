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
  tenant_id: number;
  module_id: string;
  session_id: number;
  type: string;
  available_modules?: string[];
}

import { DataSource } from 'typeorm';

import { PasswordReset } from '../entities/password-reset.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(PasswordReset)
    private readonly passwordResetRepository: Repository<PasswordReset>,
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
    available_modules?: string[];
    user: Partial<User | Admin>;
  }> {
    const { username, password, franchise_id, device_id, role } = loginDto;
    this.logger.debug(`Login attempt for username: ${username}, role: ${role}`, 'AuthService');

    let account: User | Admin | null = null;
    let accountType = 'user';
    const parsedFranchiseId = franchise_id ? Number(franchise_id) : null;

    if (role === 'parent') {
      try {
        const query = parsedFranchiseId
          ? 'SELECT pl.*, s.franchise_id FROM parent_logins pl JOIN students s ON pl.student_id = s.id WHERE pl.username = ? AND s.franchise_id = ? LIMIT 1'
          : 'SELECT pl.*, s.franchise_id FROM parent_logins pl JOIN students s ON pl.student_id = s.id WHERE pl.username = ? LIMIT 1';
        const params = parsedFranchiseId
          ? [username, parsedFranchiseId]
          : [username];
        const [parentData] = await this.dataSource.query(query, params);
        if (parentData) {
          accountType = 'parent';
          account = {
            id: parentData.id,
            username: parentData.username,
            password: parentData.password,
            role: 'parent',
            franchise_id: parentData.franchise_id,
            status: 'active',
          } as any;
        }
      } catch (e) {
        this.logger.error(`Error querying parent: ${e.message}`, 'AuthService');
      }
    } else if (role === 'student') {
      try {
        const query = parsedFranchiseId
          ? 'SELECT * FROM students WHERE (roll_no = ? OR email = ? OR login_id = ? OR enrollment_no = ?) AND franchise_id = ? LIMIT 1'
          : 'SELECT * FROM students WHERE (roll_no = ? OR email = ? OR login_id = ? OR enrollment_no = ?) LIMIT 1';
        const params = parsedFranchiseId
          ? [username, username, username, username, parsedFranchiseId]
          : [username, username, username, username];

        const [student] = await this.dataSource.query(query, params);
        if (student) {
          accountType = 'student';
          account = {
            id: student.id,
            username: student.roll_no || student.email,
            password: student.password,
            role: 'student',
            franchise_id: student.franchise_id,
            status: 'active',
          } as any;
        }
      } catch (e) {}
    } else {
      // role === 'admin' or undefined
      // 1. Check Admin Table (SuperAdmins) ONLY if no specific franchise is requested
      if (!parsedFranchiseId || parsedFranchiseId === 1) {
        const rawAdmin = await this.adminRepository.query(
          'SELECT * FROM admin WHERE username = ?',
          [username],
        );
        if (rawAdmin && rawAdmin.length > 0) {
          account = rawAdmin[0];
          accountType = 'admin';
        }
      }

      if (!account) {
        // 2. Check Users Table (Franchise scoped)
        const rawUser = await this.userRepository.query(
          'SELECT * FROM users WHERE (username = ? OR email = ?) AND (franchise_id = ? OR ? IS NULL)',
          [username, username, parsedFranchiseId, parsedFranchiseId],
        );
        if (rawUser && rawUser.length > 0) {
          account = rawUser[0];
        }

        // 2.5 Check Students Table if not found in Users and role was not specified
        if (!account && !role) {
          try {
            const query = parsedFranchiseId
              ? 'SELECT * FROM students WHERE (roll_no = ? OR email = ? OR login_id = ? OR enrollment_no = ?) AND franchise_id = ? LIMIT 1'
              : 'SELECT * FROM students WHERE (roll_no = ? OR email = ? OR login_id = ? OR enrollment_no = ?) LIMIT 1';
            const params = parsedFranchiseId
              ? [username, username, username, username, parsedFranchiseId]
              : [username, username, username, username];

            const [student] = await this.dataSource.query(query, params);
            if (student) {
              accountType = 'student';
              account = {
                id: student.id,
                username: student.roll_no || student.email,
                password: student.password,
                role: 'student',
                franchise_id: student.franchise_id,
                status: 'active',
              } as any;
            }
          } catch (e) {}
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
    let isValid = false;

    // First try the new secure hashing (Argon2id)
    isValid = await this.passwordService.verifyPassword(
      password,
      account.password as string,
    );

    // If new hashing fails, check if it's an old plaintext/legacy hash that needs migration
    if (!isValid) {
      // Legacy plaintext check
      if (password === account.password) {
        isValid = true;
      }
    }

    if (!isValid) {
      this.logger.warn(
        `Failed login: Invalid password for ${username}`,
        'AuthService',
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    // 4. Lazy Password Migration to Argon2id (DISABLED to keep plaintext passwords for Admin UI)
    /*
    if (this.passwordService.needsRehash(account.password as string)) {
      this.logger.log(
        `Migrating password for ${username} to secure hash`,
        'AuthService',
      );
      const newHash = await this.passwordService.hashPassword(password);
      if (accountType === 'admin') {
        await this.dataSource.query('UPDATE admin SET password = ? WHERE id = ?', [newHash, account.id]);
      } else if (accountType === 'student') {
        await this.dataSource.query('UPDATE students SET password = ? WHERE id = ?', [newHash, account.id]);
      } else {
        await this.dataSource.query('UPDATE users SET password = ? WHERE id = ?', [newHash, account.id]);
      }
    }
    */

    // 5. Track Session
    const sessionFranchise =
      accountType === 'admin' ? 1 : ((account as User).franchise_id as number);
    const session = await this.sessionService.createSession(
      sessionFranchise,
      account.id,
      device_id || ipAddress,
    );

    // 6. Generate Tokens — Module Assignment from Franchise License (NO username parsing)
    let franchise_logo = null;
    let branch_name = 'Arena OS';
    let branch_type = 'Computer Center';
    let available_modules: string[] = [];

    if (accountType === 'admin') {
      // Admin table = HQ Super Admin → gets ALL portals + portal switcher
      available_modules = ['hq', 'school', 'institute', 'resort'];
      branch_name = 'Arena OS HQ';
      branch_type = 'HQ';
      console.log(
        `[AUTH] HQ Admin login: ${account.username} → modules=${JSON.stringify(available_modules)}`,
      );
    } else {
      // Users table = Branch user → modules from franchise license
      if (sessionFranchise && sessionFranchise !== 0) {
        try {
          const franchiseRows = await this.dataSource.query(
            'SELECT logo, branch_name, branch_code, branch_type, plan_type, addon_institute_erp, addon_resort_erp FROM franchises WHERE id = ? LIMIT 1',
            [sessionFranchise],
          );
          const franchiseData = franchiseRows[0];
          if (franchiseData) {
            franchise_logo = franchiseData.logo;
            branch_name =
              franchiseData.branch_name ||
              franchiseData.branch_code ||
              'Arena OS';
            branch_type = franchiseData.branch_type || 'Computer Center';

            // School ERP is the base product — always included for branch users
            available_modules.push('school');

            // Institute ERP addon
            if (
              franchiseData.addon_institute_erp === 1 ||
              franchiseData.addon_institute_erp === '1'
            ) {
              available_modules.push('institute');
            }

            // Resort ERP addon
            if (
              franchiseData.addon_resort_erp === 1 ||
              franchiseData.addon_resort_erp === '1'
            ) {
              available_modules.push('resort');
            }

            console.log(
              `[AUTH] Branch login: ${account.username} franchise=${sessionFranchise} branch_type=${branch_type} addon_institute=${franchiseData.addon_institute_erp} addon_resort=${franchiseData.addon_resort_erp} → modules=${JSON.stringify(available_modules)}`,
            );
          }
        } catch (e) {
          console.error(
            '[AUTH] Error fetching franchise data:',
            (e as Error).message,
          );
        }
      }
    }

    if (available_modules.length === 0) {
      available_modules = ['school']; // Safe fallback
    }

    const payload = {
      sub: account.id,
      username: account.username,
      role: account.role,
      franchise_id: sessionFranchise,
      tenant_id: sessionFranchise,
      available_modules, // Strict Module Isolation
      session_id: session.id,
      type: accountType,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    return {
      accessToken,
      refreshToken,
      available_modules,
      user: {
        id: account.id,
        username: account.username,
        role: account.role || accountType,
        franchise_id: sessionFranchise,
        status: account.status,
        profile_photo:
          (account as any).profile_pic || (account as any).photo || '',
      },
      franchise_logo,
      branch_name,
    } as any;
  }

  async refresh(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { id: number; username: string; role: string; franchise_id: number };
  }> {
    try {
      const decoded = this.jwtService.verify<JwtPayload>(refreshToken);

      // Verify session is still active in database
      const isValidSession = await this.sessionService.verifySession(
        decoded.session_id,
        decoded.sub,
      );
      if (!isValidSession) {
        throw new UnauthorizedException(
          'Session expired or invalidated remotely',
        );
      }

      const payload = {
        sub: decoded.sub,
        username: decoded.username,
        role: decoded.role,
        franchise_id: decoded.franchise_id,
        tenant_id: decoded.tenant_id, // Restore tenant isolation
        module_id: decoded.module_id, // Restore module isolation
        session_id: decoded.session_id,
        type: decoded.type,
        available_modules: decoded.available_modules || [],
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

  async logout(sessionId: number): Promise<void> {
    if (sessionId) {
      await this.sessionService.invalidateSession(sessionId);
    }
  }

  async logoutAllDevices(userId: number): Promise<void> {
    await this.sessionService.invalidateAllUserSessions(userId);
  }

  async forgotPassword(email: string, franchiseId?: number): Promise<void> {
    // Check if user exists
    let account: any = await this.userRepository.findOne({
      where: { email, franchise_id: franchiseId },
    });
    if (!account) {
      account = await this.adminRepository.findOne({
        where: { username: email },
      });
    }

    if (account) {
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

      const reset = this.passwordResetRepository.create({
        email,
        token,
        franchise_id: franchiseId,
        expires_at: expiresAt,
      });
      await this.passwordResetRepository.save(reset);

      this.logger.log(
        `Password reset requested for ${email}. Token: ${token}`,
        'AuthService',
      );
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const reset = await this.passwordResetRepository.findOne({
      where: { token, is_used: false },
    });
    if (!reset || reset.expires_at < new Date()) {
      throw new UnauthorizedException(
        'Invalid or expired password reset token',
      );
    }

    let account: any = await this.userRepository.findOne({
      where: { email: reset.email, franchise_id: reset.franchise_id },
    });
    let isUser = true;
    if (!account) {
      account = await this.adminRepository.findOne({
        where: { username: reset.email },
      });
      isUser = false;
    }

    if (!account) {
      throw new UnauthorizedException('User no longer exists');
    }

    const newHash = await this.passwordService.hashPassword(newPassword);

    if (isUser) {
      await this.userRepository.update(account.id, { password: newHash });
    } else {
      await this.adminRepository.update(account.id, { password: newHash });
    }

    reset.is_used = true;
    await this.passwordResetRepository.save(reset);

    // Invalidate all active sessions
    await this.logoutAllDevices(account.id);

    this.logger.log(
      `Password reset successful for ${reset.email}`,
      'AuthService',
    );
  }
  async getMe(userId: number, accountType: string): Promise<any> {
    let account: any;

    if (accountType === 'admin') {
      // Admin table: id, username, password, role, status, name, email, phone, photo
      const rows = await this.dataSource.query(
        'SELECT * FROM admin WHERE id = ? LIMIT 1',
        [userId],
      );
      account = rows[0];
      if (!account) throw new UnauthorizedException('Admin account not found');
    } else if (accountType === 'student') {
      const rows = await this.dataSource.query(
        'SELECT s.*, c.course_name FROM students s LEFT JOIN courses c ON s.course_id = c.id WHERE s.id = ? LIMIT 1',
        [userId],
      );
      account = rows[0];
    } else {
      // Users table: id, franchise_id, username, password, name, role, photo, phone, email, status, profile_pic, address
      const rows = await this.dataSource.query(
        'SELECT * FROM users WHERE id = ? LIMIT 1',
        [userId],
      );
      account = rows[0];
    }

    if (!account) {
      throw new UnauthorizedException('User not found');
    }

    // Fetch franchise info for branch users
    let branch_name = 'Arena OS';
    let branch_logo = '';
    let branch_type = 'HQ';
    let franchise_name = '';

    const franchiseId = account.franchise_id;
    if (franchiseId && franchiseId !== 0) {
      try {
        const fRows = await this.dataSource.query(
          'SELECT branch_name, branch_code, logo, branch_type, owner_name FROM franchises WHERE id = ? LIMIT 1',
          [franchiseId],
        );
        if (fRows[0]) {
          branch_name =
            fRows[0].branch_name || fRows[0].branch_code || 'Arena OS';
          branch_logo = fRows[0].logo || '';
          branch_type = fRows[0].branch_type || 'Computer Center';
          franchise_name = fRows[0].branch_name || '';
        }
      } catch (e) {
        // franchise table might not be accessible
      }
    } else if (accountType === 'admin') {
      branch_name = 'Arena OS HQ';
      branch_type = 'HQ';
      franchise_name = 'Arena OS Headquarters';
    }

    // Format role for display
    const rawRole =
      account.role || (accountType === 'admin' ? 'Admin' : 'User');
    let displayRole = rawRole;
    // Proper role formatting
    const roleMap: Record<string, string> = {
      admin:
        accountType === 'admin' ? 'HQ Super Admin' : `${branch_type} Admin`,
      staff: 'Staff Member',
      receptionist: 'Receptionist',
      teacher: 'Teacher',
      accountant: 'Accountant',
      student: 'Student',
      parent: 'Parent',
      super_admin: 'HQ Super Admin',
      hq: 'HQ Admin',
    };
    displayRole =
      roleMap[rawRole.toLowerCase()] ||
      rawRole
        .split('_')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    // Determine profile photo
    let profilePhoto = account.profile_pic || account.photo || '';
    if (profilePhoto && !profilePhoto.startsWith('http')) {
      profilePhoto = `https://ictcomputereducation.com/actions/uploads/${profilePhoto}`;
    }

    // Determine display name
    let displayName = 'Unknown';
    if (accountType === 'admin') {
      displayName = account.name || account.username || 'Admin';
    } else if (accountType === 'student') {
      displayName = account.student_name || account.name || 'Student';
    } else {
      displayName = account.name || account.username || 'User';
    }

    return {
      id: account.id,
      name: displayName,
      username: account.username || account.email || '',
      email: account.email || '',
      phone: account.phone || account.contact_phone || '',
      role: rawRole,
      displayRole: displayRole,
      designation: displayRole,
      branch_name: branch_name,
      branch_type: branch_type,
      branch_logo: branch_logo,
      franchise_name: franchise_name,
      profile_photo: profilePhoto,
      franchise_id: franchiseId || 0,
      employee_id: account.id,
      status: account.status || 'Active',
      portal: accountType === 'admin' ? 'HQ' : 'Branch',
      address: account.address || '',
      last_login: account.updated_at || account.last_login_at || null,
      created_at: account.created_at || account.joined_date || null,

      // Extended student fields (only populated if accountType === 'student')
      father_name: account.father_name || '',
      admission_no: account.admission_no || '',
      batch_time: account.batch_time || '',
      course_id: account.course_id || null,
      course_name: account.course_name || '',
      dob: account.dob || '',
      blood_group: account.blood_group || '',
    };
  }
}
