// src/app/api/auth/signin/route.ts
// 🔐 ULTRA SECURE LOGIN API

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { SecurityEncryption } from '@/lib/security/encryption';
import { AttackPrevention } from '@/lib/security/attack-prevention';
import { AuditLogger } from '@/lib/security/audit-logger';
import { TwoFactorAuth } from '@/lib/security/two-factor';
import { z } from 'zod';

const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  twoFactorCode: z.string().optional(),
  rememberMe: z.boolean().optional(),
  deviceFingerprint: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    // ========================================
    // 1. PARSE AND VALIDATE INPUT
    // ========================================
    const body = await request.json();
    const validatedData = signinSchema.parse(body);

    // ========================================
    // 2. CHECK FOR SUSPICIOUS INPUT
    // ========================================
    if (AttackPrevention.isSuspicious(validatedData.email)) {
      await AuditLogger.logSecurityEvent({
        action: 'suspicious_login_attempt',
        success: false,
        failureReason: 'Suspicious input detected',
        ipAddress: ip,
        userAgent,
      });

      await AttackPrevention.blockIP(ip, 'Suspicious login attempt', 60);

      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    // ========================================
    // 3. RATE LIMITING CHECK (Extra strict for login)
    // ========================================
    const rateLimitCheck = await AttackPrevention.checkRateLimit(
      `login:${ip}`,
      5, // Only 5 attempts
      300000 // Per 5 minutes
    );

    if (!rateLimitCheck.allowed) {
      await AuditLogger.logSecurityEvent({
        action: 'login_rate_limit_exceeded',
        success: false,
        failureReason: 'Too many login attempts',
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json(
        {
          error: 'Too many login attempts. Please try again in 5 minutes.',
          retryAfter: rateLimitCheck.resetAt,
        },
        {
          status: 429,
          headers: {
            'Retry-After': '300',
            'X-RateLimit-Reset': rateLimitCheck.resetAt.toISOString(),
          },
        }
      );
    }

    // ========================================
    // 4. FIND USER
    // ========================================
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        isActive: true,
        emailVerified: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        loginAttempts: true,
        lockedUntil: true,
        lastLoginAt: true,
        lastLoginIp: true,
      },
    });

    if (!user) {
      // Don't reveal if user exists (security best practice)
      await AuditLogger.logSecurityEvent({
        action: 'login_failed',
        success: false,
        failureReason: 'User not found',
        ipAddress: ip,
        userAgent,
        metadata: { email: validatedData.email },
      });

      // Add delay to prevent timing attacks
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // ========================================
    // 5. CHECK IF ACCOUNT IS ACTIVE
    // ========================================
    if (!user.isActive) {
      await AuditLogger.logSecurityEvent({
        userId: user.id,
        action: 'login_inactive_account',
        success: false,
        failureReason: 'Account is deactivated',
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // ========================================
    // 6. CHECK IF EMAIL IS VERIFIED
    // ========================================
    if (!user.emailVerified) {
      await AuditLogger.logSecurityEvent({
        userId: user.id,
        action: 'login_unverified_email',
        success: false,
        failureReason: 'Email not verified',
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json(
        {
          error: 'Please verify your email before logging in.',
          requiresEmailVerification: true,
        },
        { status: 403 }
      );
    }

    // ========================================
    // 7. CHECK FOR ACCOUNT LOCKOUT
    // ========================================
    const bruteForceCheck = await AttackPrevention.checkBruteForce(
      user.id,
      ip
    );

    if (bruteForceCheck.blocked) {
      await AuditLogger.logSecurityEvent({
        userId: user.id,
        action: 'login_account_locked',
        success: false,
        failureReason: `Account locked for ${bruteForceCheck.lockoutMinutes} minutes`,
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json(
        {
          error: `Account is locked due to too many failed login attempts. Please try again in ${bruteForceCheck.lockoutMinutes} minutes.`,
          lockedUntil: user.lockedUntil,
        },
        { status: 423 }
      );
    }

    // ========================================
    // 8. VERIFY PASSWORD
    // ========================================
    const passwordValid = await SecurityEncryption.verifyPassword(
      validatedData.password,
      user.password
    );

    if (!passwordValid) {
      // Record failed login attempt
      await AttackPrevention.recordFailedLogin(user.id, ip);

      await AuditLogger.logSecurityEvent({
        userId: user.id,
        action: 'login_failed',
        success: false,
        failureReason: 'Invalid password',
        ipAddress: ip,
        userAgent,
      });

      // Add delay to prevent timing attacks
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // ========================================
    // 9. CHECK FOR 2FA
    // ========================================
    if (user.twoFactorEnabled) {
      // If 2FA code not provided, request it
      if (!validatedData.twoFactorCode) {
        return NextResponse.json(
          {
            requires2FA: true,
            message: 'Please enter your 2FA code',
          },
          { status: 200 }
        );
      }

      // Verify 2FA code
      const twoFactorValid = await TwoFactorAuth.verifyToken(
        user.id,
        validatedData.twoFactorCode
      );

      if (!twoFactorValid) {
        await AuditLogger.logSecurityEvent({
          userId: user.id,
          action: '2fa_failed',
          success: false,
          failureReason: 'Invalid 2FA code',
          ipAddress: ip,
          userAgent,
        });

        return NextResponse.json(
          { error: 'Invalid 2FA code' },
          { status: 401 }
        );
      }
    }

    // ========================================
    // 10. CHECK FOR SUSPICIOUS LOCATION/DEVICE
    // ========================================
    const suspiciousCheck = await AttackPrevention.detectSuspiciousActivity(
      user.id,
      ip,
      userAgent
    );

    if (suspiciousCheck.suspicious) {
      await AuditLogger.logSecurityEvent({
        userId: user.id,
        action: 'suspicious_login',
        success: true, // Login allowed but flagged
        ipAddress: ip,
        userAgent,
        metadata: {
          reasons: suspiciousCheck.reasons,
        },
      });

      // Send email alert to user
      // TODO: Implement email notification
      console.log('🚨 Suspicious login detected:', {
        userId: user.id,
        reasons: suspiciousCheck.reasons,
      });
    }

    // Check if login from new IP
    if (user.lastLoginIp && user.lastLoginIp !== ip) {
      await AuditLogger.logSecurityEvent({
        userId: user.id,
        action: 'new_ip_login',
        success: true,
        ipAddress: ip,
        userAgent,
        metadata: {
          previousIP: user.lastLoginIp,
        },
      });

      // TODO: Send email notification about new IP login
    }

    // ========================================
    // 11. RESET FAILED LOGIN ATTEMPTS
    // ========================================
    await AttackPrevention.resetLoginAttempts(user.id);

    // ========================================
    // 12. UPDATE USER LOGIN INFO
    // ========================================
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ip,
      },
    });

    // ========================================
    // 13. CREATE SESSION
    // ========================================
    const sessionToken = SecurityEncryption.generateToken(64);
    const expiresAt = new Date();
    
    if (validatedData.rememberMe) {
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
    } else {
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours
    }

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires: expiresAt,
      },
    });

    // ========================================
    // 14. LOG SUCCESSFUL LOGIN
    // ========================================
    await AuditLogger.logAuth(
      'login',
      true,
      user.id,
      ip,
      userAgent,
      {
        rememberMe: validatedData.rememberMe,
        twoFactorUsed: user.twoFactorEnabled,
        loginDuration: Date.now() - startTime,
      }
    );

    // ========================================
    // 15. RETURN SUCCESS RESPONSE
    // ========================================
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        session: {
          token: sessionToken,
          expiresAt,
        },
      },
      { status: 200 }
    );

    // Set secure cookie
    response.cookies.set('session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return response;
  } catch (error) {
    // ========================================
    // ERROR HANDLING
    // ========================================
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Login error:', error);

    await AuditLogger.logSecurityEvent({
      action: 'login_error',
      success: false,
      failureReason: error instanceof Error ? error.message : 'Unknown error',
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json(
      { error: 'An error occurred during login. Please try again.' },
      { status: 500 }
    );
  }
}
