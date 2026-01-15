// src/lib/security/attack-prevention.ts
// 🛡️ Advanced Attack Prevention System

import { prisma } from '@/lib/db';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export class AttackPrevention {
  /**
   * Rate Limiting - Advanced
   */
  static async checkRateLimit(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 60000
  ): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      // Get request count in window
      const requests = await redis.zcount(key, windowStart, now);

      if (requests >= maxRequests) {
        const oldestRequest = await redis.zrange(key, 0, 0, { withScores: true });
        const resetAt = new Date(
          parseInt(oldestRequest[1] as string) + windowMs
        );

        return {
          allowed: false,
          remaining: 0,
          resetAt,
        };
      }

      // Add current request
      await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` });

      // Clean old entries
      await redis.zremrangebyscore(key, 0, windowStart);

      // Set expiry
      await redis.expire(key, Math.ceil(windowMs / 1000));

      return {
        allowed: true,
        remaining: maxRequests - requests - 1,
        resetAt: new Date(now + windowMs),
      };
    } catch (error) {
      console.error('Rate limit error:', error);
      // Fail open - allow request on error
      return {
        allowed: true,
        remaining: maxRequests,
        resetAt: new Date(now + windowMs),
      };
    }
  }

  /**
   * Brute Force Protection - Using Redis for tracking
   */
  static async checkBruteForce(
    userId: string,
    ipAddress: string
  ): Promise<{ blocked: boolean; lockoutMinutes?: number }> {
    try {
      const lockKey = `bruteforce:${userId}`;
      const lockData = await redis.get<{ until: number; attempts: number }>(lockKey);

      if (lockData && lockData.until > Date.now()) {
        const lockoutMinutes = Math.ceil((lockData.until - Date.now()) / 60000);

        await prisma.securityLog.create({
          data: {
            userId,
            action: 'login_attempt_locked',
            success: false,
            failureReason: 'Account locked',
            ipAddress,
            userAgent: 'system',
          },
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
  static async recordFailedLogin(
    userId: string,
    ipAddress: string
  ): Promise<void> {
    try {
      const attemptsKey = `login_attempts:${userId}`;
      const lockKey = `bruteforce:${userId}`;
      
      // Increment failed attempts
      const attempts = await redis.incr(attemptsKey);
      
      // Set expiry for attempts counter (15 minutes)
      await redis.expire(attemptsKey, 900);

      let lockedUntil: number | null = null;

      // Lock account after 5 failed attempts
      if (attempts >= 5) {
        // Exponential lockout: 5 mins, 15 mins, 30 mins, 1 hour, 24 hours
        const lockoutMinutes = [5, 15, 30, 60, 1440][
          Math.min(attempts - 5, 4)
        ];
        lockedUntil = Date.now() + lockoutMinutes * 60000;
        
        // Store lock in Redis
        await redis.setex(
          lockKey,
          lockoutMinutes * 60,
          JSON.stringify({ until: lockedUntil, attempts })
        );
      }

      await prisma.securityLog.create({
        data: {
          userId,
          action: 'failed_login',
          success: false,
          failureReason: `Failed attempt ${attempts}${
            lockedUntil ? ` - Account locked until ${new Date(lockedUntil).toISOString()}` : ''
          }`,
          ipAddress,
          userAgent: 'system',
        },
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
      
      await redis.del(attemptsKey);
      await redis.del(lockKey);
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
   * XSS (Cross-Site Scripting) Detection
   */
  static detectXSS(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi, // Event handlers like onclick=
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
      .replace(/[<>]/g, '') // Remove < and >
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
      input.includes('..') || // Path traversal
      input.includes('%00') || // Null byte injection
      input.length > 10000 // Abnormally long input
    );
  }

  /**
   * CSRF Token Generation
   */
  static async generateCSRFToken(sessionId: string): Promise<string> {
    const token = SecurityEncryption.generateToken(32);
    await redis.setex(`csrf:${sessionId}`, 3600, token); // 1 hour expiry
    return token;
  }

  /**
   * CSRF Token Verification
   */
  static async verifyCSRFToken(
    sessionId: string,
    token: string
  ): Promise<boolean> {
    const storedToken = await redis.get(`csrf:${sessionId}`);
    return storedToken === token;
  }

  /**
   * IP Blocking Check
   */
  static async isIPBlocked(ipAddress: string): Promise<boolean> {
    const blocked = await redis.get(`blocked:ip:${ipAddress}`);
    return blocked === 'true';
  }

  /**
   * Block IP Address
   */
  static async blockIP(
    ipAddress: string,
    reason: string,
    durationMinutes: number = 60
  ): Promise<void> {
    await redis.setex(
      `blocked:ip:${ipAddress}`,
      durationMinutes * 60,
      'true'
    );

    await prisma.securityLog.create({
      data: {
        action: 'ip_blocked',
        success: true,
        ipAddress,
        userAgent: 'system',
        metadata: JSON.stringify({ reason, durationMinutes }),
      },
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

    // Check if IP is blocked
    if (await this.isIPBlocked(ipAddress)) {
      reasons.push('IP address is blocked');
    }

    // Check if user agent is suspicious
    if (this.isBot(userAgent)) {
      reasons.push('Bot/crawler detected');
    }

    // Check for multiple accounts from same IP
    const accountsFromIP = await prisma.securityLog.groupBy({
      by: ['userId'],
      where: {
        ipAddress,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    if (accountsFromIP.length > 5) {
      reasons.push('Multiple accounts from same IP');
    }

    // Check for rapid requests
    const recentRequests = await redis.get(`requests:${userId}`);
    if (recentRequests && parseInt(recentRequests as string) > 1000) {
      reasons.push('Abnormally high request rate');
    }

    return {
      suspicious: reasons.length > 0,
      reasons,
    };
  }

  /**
   * Session Hijacking Prevention - Check for anomalies
   */
  static async checkSessionAnomaly(
    sessionId: string,
    currentIP: string,
    currentUserAgent: string
  ): Promise<boolean> {
    const sessionKey = `session:${sessionId}`;
    const storedSession = await redis.get<{
      ip: string;
      userAgent: string;
    }>(sessionKey);

    if (!storedSession) {
      // First time - store session info
      await redis.setex(
        sessionKey,
        86400, // 24 hours
        JSON.stringify({ ip: currentIP, userAgent: currentUserAgent })
      );
      return false;
    }

    const session =
      typeof storedSession === 'string'
        ? JSON.parse(storedSession)
        : storedSession;

    // Check if IP or user agent changed
    if (session.ip !== currentIP || session.userAgent !== currentUserAgent) {
      await prisma.securityLog.create({
        data: {
          action: 'session_anomaly',
          success: false,
          ipAddress: currentIP,
          userAgent: currentUserAgent,
          metadata: JSON.stringify({
            originalIP: session.ip,
            originalUserAgent: session.userAgent,
          }),
        },
      });

      return true; // Anomaly detected
    }

    return false;
  }
}

// Import SecurityEncryption
import { SecurityEncryption } from './encryption';
