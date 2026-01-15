// src/lib/security/two-factor.ts

import { prisma } from '@/lib/db';
import { SecurityEncryption } from './encryption';
import crypto from 'crypto';

/**
 * Simple TOTP Implementation (Time-based One-Time Password)
 * Based on RFC 6238
 */
class SimpleTOTP {
  private static readonly DIGITS = 6;
  private static readonly PERIOD = 30; // seconds
  
  /**
   * Generate TOTP secret (base32 encoded random bytes)
   */
  static generateSecret(): string {
    const buffer = crypto.randomBytes(20);
    return this.base32Encode(buffer);
  }

  /**
   * Generate TOTP token from secret
   */
  static generate(secret: string, time?: number): string {
    const counter = Math.floor((time || Date.now()) / 1000 / this.PERIOD);
    const decodedSecret = this.base32Decode(secret);
    
    // Create HMAC-SHA1
    const hmac = crypto.createHmac('sha1', Buffer.from(decodedSecret));
    
    // Counter as 8-byte buffer
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigInt64BE(BigInt(counter));
    
    hmac.update(counterBuffer);
    const hash = hmac.digest();
    
    // Dynamic truncation
    const offset = hash[hash.length - 1] & 0x0f;
    const code = (
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff)
    ) % Math.pow(10, this.DIGITS);
    
    return code.toString().padStart(this.DIGITS, '0');
  }

  /**
   * Verify TOTP token
   */
  static verify(secret: string, token: string, window: number = 2): boolean {
    const now = Date.now();
    
    // Check current time and window before/after
    for (let i = -window; i <= window; i++) {
      const time = now + (i * this.PERIOD * 1000);
      const expectedToken = this.generate(secret, time);
      
      if (expectedToken === token) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Generate otpauth URL for QR code
   */
  static generateURL(secret: string, label: string, issuer: string): string {
    const params = new URLSearchParams({
      secret,
      issuer,
      algorithm: 'SHA1',
      digits: this.DIGITS.toString(),
      period: this.PERIOD.toString(),
    });
    
    return `otpauth://totp/${encodeURIComponent(label)}?${params}`;
  }

  /**
   * Base32 encoding (simplified for TOTP)
   */
  private static base32Encode(buffer: Buffer): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let output = '';

    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer[i];
      bits += 8;

      while (bits >= 5) {
        output += alphabet[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }

    if (bits > 0) {
      output += alphabet[(value << (5 - bits)) & 31];
    }

    return output;
  }

  /**
   * Base32 decoding
   */
  private static base32Decode(str: string): Uint8Array {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    const output: number[] = [];

    for (let i = 0; i < str.length; i++) {
      const idx = alphabet.indexOf(str[i].toUpperCase());
      if (idx === -1) continue;

      value = (value << 5) | idx;
      bits += 5;

      if (bits >= 8) {
        output.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }

    return new Uint8Array(output);
  }
}

export class TwoFactorAuth {
  /**
   * Generate 2FA secret for user
   */
  static async generateSecret(userId: string, email: string) {
    const secret = SimpleTOTP.generateSecret();

    // Encrypt secret before storing
    const encrypted = SecurityEncryption.encrypt(secret);

    // Store encrypted secret
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: JSON.stringify(encrypted),
      },
    });

    // Generate URL for QR code
    const otpauthURL = SimpleTOTP.generateURL(
      secret,
      `Va Travel (${email})`,
      'Va Travel'
    );

    return {
      secret,
      qrCodeURL: otpauthURL,
    };
  }

  /**
   * Verify 2FA token
   */
  static async verifyToken(userId: string, token: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true },
    });

    if (!user?.twoFactorSecret) {
      throw new Error('2FA not enabled');
    }

    // Decrypt secret
    const encrypted = JSON.parse(user.twoFactorSecret);
    const secret = SecurityEncryption.decrypt(
      encrypted.encrypted,
      encrypted.iv,
      encrypted.tag
    );

    // Verify token
    const verified = SimpleTOTP.verify(secret, token);

    if (verified) {
      // Log successful 2FA
      await prisma.securityLog.create({
        data: {
          userId,
          action: '2fa_verified',
          success: true,
          ipAddress: 'internal',
          userAgent: 'system',
        },
      }).catch(() => {
        // Ignore if SecurityLog doesn't exist
      });
    }

    return verified;
  }

  /**
   * Enable 2FA for user
   */
  static async enable(userId: string, token: string): Promise<boolean> {
    const verified = await this.verifyToken(userId, token);

    if (!verified) {
      return false;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    await prisma.securityLog.create({
      data: {
        userId,
        action: '2fa_enabled',
        success: true,
        ipAddress: 'internal',
        userAgent: 'system',
      },
    }).catch(() => {
      // Ignore if SecurityLog doesn't exist
    });

    return true;
  }

  /**
   * Disable 2FA for user
   */
  static async disable(userId: string, password: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user?.password) {
      return false;
    }

    // Verify password before disabling
    const passwordValid = await SecurityEncryption.verifyPassword(
      password,
      user.password
    );

    if (!passwordValid) {
      return false;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    await prisma.securityLog.create({
      data: {
        userId,
        action: '2fa_disabled',
        success: true,
        ipAddress: 'internal',
        userAgent: 'system',
      },
    }).catch(() => {
      // Ignore if SecurityLog doesn't exist
    });

    return true;
  }

  /**
   * Generate backup codes
   */
  static async generateBackupCodes(userId: string): Promise<string[]> {
    const codes: string[] = [];

    for (let i = 0; i < 10; i++) {
      const code = SecurityEncryption.generateToken(8);
      codes.push(code);
    }

    // Hash and store backup codes
    const hashedCodes = await Promise.all(
      codes.map((code) => SecurityEncryption.hashPassword(code))
    );

    await prisma.user.update({
      where: { id: userId },
      data: {
        backupCodes: JSON.stringify(hashedCodes),
      },
    });

    return codes;
  }

  /**
   * Verify backup code
   */
  static async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { backupCodes: true },
    });

    if (!user?.backupCodes) {
      return false;
    }

    const hashedCodes = JSON.parse(user.backupCodes);

    for (let i = 0; i < hashedCodes.length; i++) {
      const valid = await SecurityEncryption.verifyPassword(code, hashedCodes[i]);

      if (valid) {
        // Remove used code
        hashedCodes.splice(i, 1);

        await prisma.user.update({
          where: { id: userId },
          data: {
            backupCodes: JSON.stringify(hashedCodes),
          },
        });

        await prisma.securityLog.create({
          data: {
            userId,
            action: 'backup_code_used',
            success: true,
            ipAddress: 'internal',
            userAgent: 'system',
          },
        }).catch(() => {
          // Ignore if SecurityLog doesn't exist
        });

        return true;
      }
    }

    return false;
  }
}
