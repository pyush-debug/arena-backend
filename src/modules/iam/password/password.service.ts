import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcryptjs from 'bcryptjs';
import { CustomLoggerService } from '../../../core/logger/custom-logger.service';

@Injectable()
export class PasswordService {
  constructor(private readonly logger: CustomLoggerService) {}

  async hashPassword(password: string): Promise<string> {
    return bcryptjs.hash(password, 10);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    if (!hash) return false;

    if (hash.startsWith('$') || hash.startsWith('$') || hash.startsWith('$')) {
      return bcryptjs.compare(password, hash);
    }

    if (hash.length === 32 && /^[a-f0-9]{32}$/i.test(hash)) {
      const md5Hash = crypto.createHash('md5').update(password).digest('hex');
      return md5Hash === hash;
    }

    if (password === hash) {
      this.logger.warn('CRITICAL SECURITY WARNING: Plain text password fallback used for authentication.');
      return true;
    }
    return false;
  }

  needsRehash(hash: string): boolean {
    if (!hash) return true;
    return !(hash.startsWith('$') || hash.startsWith('$') || hash.startsWith('$'));
  }

  validateComplexity(password: string): boolean {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  }
}
