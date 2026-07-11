/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from '../../../core/logger/custom-logger.service';
// @ts-ignore
import { authenticator } from 'otplib';

@Injectable()
export class MfaService {
  constructor(private readonly logger: CustomLoggerService) {}

  /**
   * Generates a TOTP secret and QR code URL for Authenticator Apps.
   */
  generateTotpSecret(username: string, franchiseName: string) {
    this.logger.log(`Generating TOTP secret for ${username}`, 'MfaService');

    const secret = authenticator.generateSecret();

    const otpauthUrl = authenticator.keyuri(username, franchiseName, secret);
    return {
      secret,
      qrUrl: otpauthUrl,
    };
  }

  /**
   * Verifies a TOTP token against a secret.
   */
  verifyTotp(token: string, secret: string): boolean {
    return authenticator.verify({ token, secret });
  }

  /**
   * Sends an OTP via SMS/Email.
   */
  sendOtp(contact: string, type: 'SMS' | 'EMAIL') {
    this.logger.log(`Sending ${type} OTP to ${contact}`, 'MfaService');
    // Trigger external SMS/Email gateway logic via Event Bus
  }
}
