// src/lib/security/two-factor.ts
// 🔐 Two-Factor Authentication System

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { prisma } from '@/lib/db';
import { SecurityEncryption } from './encryption';

export class TwoFactorAuth {
  /**
   * Generate 2FA secret for user
   */
  static async generateSecret(userId: string, email: string) {
    const secret = speakeasy.generateSecret({
      name: `Va Travel (${email})`,
      issuer: 'Va Travel',
      length: 32,
    });

    // Encrypt secret before storing
    const encrypted = SecurityEncryption.encrypt(secret.base32);

    // Store encrypted secret
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: JSON.stringify(encrypted),
      },
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode,
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
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps before/after
    });

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

    if (!user) {
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
  static async verifyBackupCode(
    userId: string,
    code: string
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { backupCodes: true },
    });

    if (!user?.backupCodes) {
      return false;
    }

    const hashedCodes = JSON.parse(user.backupCodes);

    for (let i = 0; i < hashedCodes.length; i++) {
      const valid = await SecurityEncryption.verifyPassword(
        code,
        hashedCodes[i]
      );

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
        });

        return true;
      }
    }

    return false;
  }
}
