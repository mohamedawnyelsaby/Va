// src/lib/security/attack-prevention.ts

import { prisma } from '@/lib/db';
import { SecurityEncryption } from './encryption';

// ✅ In-Memory Storage للـ Rate Limiting
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const bruteForceStore = new Map<string, { attempts: number; lockedUntil: number }>();
const blockedIPs = new Set<string>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  
  // Clean rate limits
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetAt) {
      rateLimitStore.delete(key);
    }
  }
  
  // Clean brute force attempts
  for (const [key, value] of bruteForceStore.entries()) {
    if (now > value.lockedUntil) {
      bruteForceStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export class AttackPrevention {
  /**
   * Rate Limiting - In-Memory Implementation
   */
  static async checkRateLimit(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 60000
  ): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    try {
      const key = `ratelimit:${identifier}`;
      const now = Date.now();
      
      const current = rateLimitStore.get(key);
      
      // If no entry or expired, create new
      if (!current || now > current.resetAt) {
        rateLimitStore.set(key, {
          count: 1,
          resetAt: now + windowMs,
        });
        
        return {
          allowed: true,
          remaining: maxRequests - 1,
          resetAt: new Date(now + windowMs),
        };
      }
      
      // Check if limit exceeded
      if (current.count >= maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: new Date(current.resetAt),
        };
      }
      
      // Increment count
      current.count++;
      
      return {
        allowed: true,
        remaining: maxRequests - current.count,
        resetAt: new Date(current.resetAt),
      };
    } catch (error) {
      console.error('Rate limit error:', error);
      // Fail open on error
      return {
        allowed: true,
        remaining: maxRequests,
        resetAt: new Date(Date.now() + windowMs),
      };
    }
  }

  /**
   * Brute Force Protection
   */
  static async checkBruteForce(
    userId: string,
    ipAddress: string
  ): Promise<{ blocked: boolean; lockoutMinutes?: number }> {
    try {
      const lockKey = `bruteforce:${userId}`;
      const lockData = bruteForceStore.get(lockKey);

      if (lockData && lockData.lockedUntil > Date.now()) {
        const lockoutMinutes = Math.ceil((lockData.lockedUntil - Date.now()) / 60000);

        await prisma.securityLog.create({
          data: {
            userId,
            action: 'login_attempt_locked',
            success: false,
            failureReason: 'Account locked',
            ipAddress,
            userAgent: 'system',
          },
        }).catch(() => {
          // Ignore if SecurityLog model doesn't exist yet
        });

        return { blocked: true, lockoutMinutes };
      }

      return { blocked: false };
    } catch (error) {
      console.error('Brute force check error:', error);
      return { blocked: false };
    }
  }

  /**
   * Record failed login attempt
   */
  static async recordFailedLogin(userId: string, ipAddress: string): Promise<void> {
    try {
      const attemptsKey = `login_attempts:${userId}`;
      const lockKey = `bruteforce:${userId}`;
      
      const current = bruteForceStore.get(attemptsKey) || { attempts: 0, lockedUntil: 0 };
      current.attempts++;
      
      // Set expiry (15 minutes)
      current.lockedUntil = Date.now() + 15 * 60 * 1000;
      bruteForceStore.set(attemptsKey, current);

      let lockedUntil: number | null = null;

      // Lock account after 5 failed attempts
      if (current.attempts >= 5) {
        const lockoutMinutes = [5, 15, 30, 60, 1440][Math.min(current.attempts - 5, 4)];
        lockedUntil = Date.now() + lockoutMinutes * 60000;
        
        bruteForceStore.set(lockKey, {
          attempts: current.attempts,
          lockedUntil,
        });
      }

      await prisma.securityLog.create({
        data: {
          userId,
          action: 'failed_login',
          success: false,
          failureReason: `Failed attempt ${current.attempts}${
            lockedUntil ? ` - Account locked until ${new Date(lockedUntil).toISOString()}` : ''
          }`,
          ipAddress,
          userAgent: 'system',
        },
      }).catch(() => {
        // Ignore if SecurityLog model doesn't exist yet
      });
    } catch (error) {
      console.error('Record failed login error:', error);
    }
  }

  /**
   * Reset login attempts on successful login
   */
  static async resetLoginAttempts(userId: string): Promise<void> {
    try {
      const attemptsKey = `login_attempts:${userId}`;
      const lockKey = `bruteforce:${userId}`;
      
      bruteForceStore.delete(attemptsKey);
      bruteForceStore.delete(lockKey);
    } catch (error) {
      console.error('Reset login attempts error:', error);
    }
  }

  /**
   * SQL Injection Detection
   */
  static detectSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\bUNION\b.*\bSELECT\b)/i,
      /(\bINSERT\b.*\bINTO\b)/i,
      /(\bDROP\b.*\b(TABLE|DATABASE)\b)/i,
      /(\bDELETE\b.*\bFROM\b)/i,
      /(\bUPDATE\b.*\bSET\b)/i,
      /(--|\#|\/\*|\*\/)/,
      /(\bOR\b.*=.*)/i,
      /(\bAND\b.*=.*)/i,
      /(\bEXEC\b|\bEXECUTE\b)/i,
      /(\bDECLARE\b|\bCAST\b)/i,
      /('.*OR.*'=')/i,
      /(".*OR.*"=")/i,
      /(;.*DROP)/i,
      /(';.*--)/i,
    ];

    return sqlPatterns.some((pattern) => pattern.test(input));
  }

  /**
   * XSS Detection
   */
  static detectXSS(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<embed/gi,
      /<object/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi,
    ];

    return xssPatterns.some((pattern) => pattern.test(input));
  }

  /**
   * Sanitize input
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  /**
   * Check for suspicious patterns
   */
  static isSuspicious(input: string): boolean {
    return (
      this.detectSQLInjection(input) ||
      this.detectXSS(input) ||
      input.includes('..') ||
      input.includes('%00') ||
      input.length > 10000
    );
  }

  /**
   * CSRF Token Generation
   */
  static async generateCSRFToken(sessionId: string): Promise<string> {
    const token = SecurityEncryption.generateToken(32);
    // Store in memory for 1 hour
    setTimeout(() => {
      rateLimitStore.delete(`csrf:${sessionId}`);
    }, 3600000);
    
    rateLimitStore.set(`csrf:${sessionId}`, { count: 0, resetAt: Date.now() + 3600000 });
    return token;
  }

  /**
   * IP Blocking Check
   */
  static async isIPBlocked(ipAddress: string): Promise<boolean> {
    return blockedIPs.has(ipAddress);
  }

  /**
   * Block IP Address
   */
  static async blockIP(ipAddress: string, reason: string, durationMinutes: number = 60): Promise<void> {
    blockedIPs.add(ipAddress);
    
    // Auto-unblock after duration
    setTimeout(() => {
      blockedIPs.delete(ipAddress);
    }, durationMinutes * 60 * 1000);

    await prisma.securityLog.create({
      data: {
        action: 'ip_blocked',
        success: true,
        ipAddress,
        userAgent: 'system',
        metadata: { reason, durationMinutes },
      },
    }).catch(() => {
      // Ignore if SecurityLog doesn't exist
    });
  }

  /**
   * Check for bot/crawler
   */
  static isBot(userAgent: string): boolean {
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
    ];

    return botPatterns.some((pattern) => pattern.test(userAgent));
  }

  /**
   * Detect suspicious activity
   */
  static async detectSuspiciousActivity(
    userId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{ suspicious: boolean; reasons: string[] }> {
    const reasons: string[] = [];

    if (await this.isIPBlocked(ipAddress)) {
      reasons.push('IP address is blocked');
    }

    if (this.isBot(userAgent)) {
      reasons.push('Bot/crawler detected');
    }

    try {
      const recentLogs = await prisma.securityLog.groupBy({
        by: ['userId'],
        where: {
          ipAddress,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
        _count: true,
      });

      if (recentLogs.length > 5) {
        reasons.push('Multiple accounts from same IP');
      }
    } catch (error) {
      // Ignore if SecurityLog doesn't exist
    }

    const requestKey = `requests:${userId}`;
    const requests = rateLimitStore.get(requestKey);
    if (requests && requests.count > 1000) {
      reasons.push('Abnormally high request rate');
    }

    return {
      suspicious: reasons.length > 0,
      reasons,
    };
  }

  /**
   * Session Anomaly Check
   */
  static async checkSessionAnomaly(
    sessionId: string,
    currentIP: string,
    currentUserAgent: string
  ): Promise<boolean> {
    const sessionKey = `session:${sessionId}`;
    const stored = rateLimitStore.get(sessionKey);

    if (!stored) {
      // Store session info
      rateLimitStore.set(sessionKey, {
        count: 0,
        resetAt: Date.now() + 24 * 60 * 60 * 1000,
      });
      return false;
    }

    // In real implementation, you'd check IP/UA changes here
    return false;
  }
}
