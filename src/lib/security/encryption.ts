// src/lib/security/encryption.ts
// 🔒 Advanced Encryption System

import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
const IV_LENGTH = 16;
const SALT_ROUNDS = 12;

export class SecurityEncryption {
  /**
   * Encrypt sensitive data (AES-256-GCM)
   */
  static encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      Buffer.from(ENCRYPTION_KEY),
      iv
    );

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(encrypted: string, iv: string, tag: string): string {
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(ENCRYPTION_KEY),
      Buffer.from(iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(tag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Hash password with bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Verify password
   */
  static async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate secure random token
   */
  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate secure OTP
   */
  static generateOTP(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[crypto.randomInt(0, digits.length)];
    }
    return otp;
  }

  /**
   * Hash data with SHA-256
   */
  static hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate HMAC signature
   */
  static generateHMAC(data: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }

  /**
   * Verify HMAC signature
   */
  static verifyHMAC(data: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateHMAC(data, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}
