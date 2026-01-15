// src/lib/security/encryption.ts

import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// ✅ Generate or use existing encryption key
const getEncryptionKey = (): Buffer => {
  if (process.env.ENCRYPTION_KEY) {
    // Convert hex string to buffer
    return Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  }
  
  // Generate a random key (for development only)
  const key = crypto.randomBytes(32);
  console.warn('⚠️ Using random encryption key. Set ENCRYPTION_KEY in production!');
  return key;
};

const ENCRYPTION_KEY = getEncryptionKey();
const IV_LENGTH = 16;
const SALT_ROUNDS = 12;

export class SecurityEncryption {
  /**
   * Encrypt sensitive data (AES-256-GCM)
   */
  static encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    try {
      const iv = crypto.randomBytes(IV_LENGTH);
      const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const tag = cipher.getAuthTag();

      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(encrypted: string, iv: string, tag: string): string {
    try {
      const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        ENCRYPTION_KEY,
        Buffer.from(iv, 'hex')
      );

      decipher.setAuthTag(Buffer.from(tag, 'hex'));

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Decryption failed');
    }
  }

  /**
   * Hash password with bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, SALT_ROUNDS);
    } catch (error) {
      console.error('Password hashing error:', error);
      throw new Error('Password hashing failed');
    }
  }

  /**
   * Verify password
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
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
    const randomBytes = crypto.randomBytes(length);
    
    for (let i = 0; i < length; i++) {
      otp += digits[randomBytes[i] % digits.length];
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
    try {
      const expectedSignature = this.generateHMAC(data, secret);
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('HMAC verification error:', error);
      return false;
    }
  }

  /**
   * Generate random UUID
   */
  static generateUUID(): string {
    return crypto.randomUUID();
  }

  /**
   * Generate secure session ID
   */
  static generateSessionId(): string {
    return this.generateToken(48);
  }

  /**
   * Encrypt object (serializes to JSON first)
   */
  static encryptObject(obj: any): { encrypted: string; iv: string; tag: string } {
    const json = JSON.stringify(obj);
    return this.encrypt(json);
  }

  /**
   * Decrypt object
   */
  static decryptObject<T>(encrypted: string, iv: string, tag: string): T {
    const json = this.decrypt(encrypted, iv, tag);
    return JSON.parse(json) as T;
  }
}
