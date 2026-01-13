// src/app/api/auth/signup/route.ts
// 🔐 ULTRA SECURE SIGNUP API

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { SecurityEncryption } from '@/lib/security/encryption';
import { AttackPrevention } from '@/lib/security/attack-prevention';
import { AuditLogger } from '@/lib/security/audit-logger';
import { z } from 'zod';

// Strong password requirements
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[^A-Za-z0-9]/,
    'Password must contain at least one special character'
  )
  .refine(
    (password) => {
      // Check for common passwords
      const commonPasswords = [
        'password',
        '12345678',
        'qwerty',
        'abc123',
        'password123',
      ];
      return !commonPasswords.includes(password.toLowerCase());
    },
    { message: 'Password is too common' }
  );

const signupSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .refine(
      (email) => {
        // Block disposable email domains
        const disposableDomains = [
          'tempmail.com',
          '10minutemail.com',
          'guerrillamail.com',
          'mailinator.com',
        ];
        const domain = email.split('@')[1];
        return !disposableDomains.includes(domain);
      },
      { message: 'Disposable email addresses are not allowed' }
    ),
  password: passwordSchema,
  confirmPassword: z.string(),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s\u0600-\u06FF]+$/, 'Name contains invalid characters'),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
    .optional(),
  referralCode: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
  captchaToken: z.string().optional(), // For future captcha integration
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    // ========================================
    // 1. RATE LIMITING (Prevent mass registration)
    // ========================================
    const rateLimitCheck = await AttackPrevention.checkRateLimit(
      `signup:${ip}`,
      3, // Only 3 signups
      3600000 // Per hour
    );

    if (!rateLimitCheck.allowed) {
      await AuditLogger.logSecurityEvent({
        action: 'signup_rate_limit_exceeded',
        success: false,
        failureReason: 'Too many signup attempts',
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json(
        {
          error: 'Too many signup attempts. Please try again later.',
          retryAfter: rateLimitCheck.resetAt,
        },
        { status: 429 }
      );
    }

    // ========================================
    // 2. PARSE AND VALIDATE INPUT
    // ========================================
    const body = await request.json();
    const validatedData = signupSchema.parse(body);

    // ========================================
    // 3. CHECK FOR SUSPICIOUS INPUT
    // ========================================
    if (
      AttackPrevention.isSuspicious(validatedData.email) ||
      AttackPrevention.isSuspicious(validatedData.name)
    ) {
      await AuditLogger.logSecurityEvent({
        action: 'suspicious_signup_attempt',
        success: false,
        failureReason: 'Suspicious input detected',
        ipAddress: ip,
        userAgent,
      });

      await AttackPrevention.blockIP(ip, 'Suspicious signup attempt', 60);

      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    // ========================================
    // 4. CHECK IF EMAIL ALREADY EXISTS
    // ========================================
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      await AuditLogger.logSecurityEvent({
        action: 'signup_duplicate_email',
        success: false,
        failureReason: 'Email already registered',
        ipAddress: ip,
        userAgent,
        metadata: { email: validatedData.email },
      });

      // Don't reveal if email exists (security best practice)
      // But for better UX, we'll inform the user
      return NextResponse.json(
        {
          error: 'An account with this email already exists',
          suggestion: 'Try logging in or use password recovery',
        },
        { status: 400 }
      );
    }

    // ========================================
    // 5. CHECK PHONE NUMBER IF PROVIDED
    // ========================================
    if (validatedData.phone) {
      const existingPhone = await prisma.user.findFirst({
        where: { phone: validatedData.phone },
      });

      if (existingPhone) {
        return NextResponse.json(
          { error: 'This phone number is already registered' },
          { status: 400 }
        );
      }
    }

    // ========================================
    // 6. VALIDATE REFERRAL CODE
    // ========================================
    let referredById: string | undefined;
    let referrerName: string | undefined;

    if (validatedData.referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: validatedData.referralCode },
        select: { id: true, name: true, isActive: true },
      });

      if (!referrer || !referrer.isActive) {
        return NextResponse.json(
          { error: 'Invalid referral code' },
          { status: 400 }
        );
      }

      referredById = referrer.id;
      referrerName = referrer.name || 'A friend';
    }

    // ========================================
    // 7. HASH PASSWORD (Bcrypt with 12 rounds)
    // ========================================
    const hashedPassword = await SecurityEncryption.hashPassword(
      validatedData.password
    );

    // ========================================
    // 8. GENERATE EMAIL VERIFICATION TOKEN
    // ========================================
    const emailVerificationToken = SecurityEncryption.generateToken(32);
    const emailVerificationExpiry = new Date();
    emailVerificationExpiry.setHours(emailVerificationExpiry.getHours() + 24); // 24 hours

    // ========================================
    // 9. GENERATE UNIQUE REFERRAL CODE
    // ========================================
    const generateReferralCode = async (): Promise<string> => {
      const code = SecurityEncryption.generateToken(8).toUpperCase();
      const exists = await prisma.user.findUnique({
        where: { referralCode: code },
      });
      return exists ? generateReferralCode() : code;
    };

    const referralCode = await generateReferralCode();

    // ========================================
    // 10. CREATE USER IN DATABASE
    // ========================================
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        phone: validatedData.phone,
        referredById,
        referralCode,
        emailVerificationToken,
        emailVerificationExpiry,
        piBalance: referredById ? 5 : 2, // Bonus for referrals
        loyaltyTier: 'bronze',
        isActive: true,
        emailVerified: null,
      },
    });

    // ========================================
    // 11. CREATE USER PREFERENCES
    // ========================================
    await prisma.preference.create({
      data: {
        userId: user.id,
        currency: 'USD',
        language: 'en',
        notificationsEnabled: true,
        emailNotifications: true,
        marketingEmails: true,
      },
    });

    // ========================================
    // 12. HANDLE REFERRAL REWARDS
    // ========================================
    if (referredById) {
      // Give referrer 10 Pi
      const referrerNewBalance = await prisma.user.update({
        where: { id: referredById },
        data: { piBalance: { increment: 10 } },
      });

      // Create Pi transactions
      await prisma.piTransaction.createMany({
        data: [
          {
            userId: referredById,
            type: 'referral',
            amount: 10,
            description: `Referral bonus for inviting ${validatedData.name}`,
            balanceAfter: referrerNewBalance.piBalance,
            status: 'completed',
          },
          {
            userId: user.id,
            type: 'referral',
            amount: 5,
            description: `Welcome bonus - Referred by ${referrerName}`,
            balanceAfter: 5,
            status: 'completed',
          },
        ],
      });

      // Create notifications
      await prisma.notification.createMany({
        data: [
          {
            userId: referredById,
            type: 'system',
            title: '🎉 Referral Bonus Earned!',
            message: `${validatedData.name} joined using your referral code! You earned 10 Pi.`,
            isRead: false,
          },
          {
            userId: user.id,
            type: 'system',
            title: '🎁 Welcome to Va Travel!',
            message: `You received 5 Pi as a welcome bonus! Referred by ${referrerName}.`,
            isRead: false,
          },
        ],
      });
    } else {
      // Regular welcome notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'system',
          title: '👋 Welcome to Va Travel!',
          message:
            'Thank you for joining! You received 2 Pi as a welcome bonus. Start exploring amazing destinations!',
          isRead: false,
        },
      });

      await prisma.piTransaction.create({
        data: {
          userId: user.id,
          type: 'signup_bonus',
          amount: 2,
          description: 'Welcome bonus for new users',
          balanceAfter: 2,
          status: 'completed',
        },
      });
    }

    // ========================================
    // 13. LOG SUCCESSFUL SIGNUP
    // ========================================
    await AuditLogger.logAuth(
      'signup',
      true,
      user.id,
      ip,
      userAgent,
      {
        hasReferral: !!referredById,
        signupDuration: Date.now() - startTime,
      }
    );

    await AuditLogger.logAction({
      userId: user.id,
      action: 'user_created',
      entityType: 'user',
      entityId: user.id,
      ipAddress: ip,
      userAgent,
      metadata: {
        email: user.email,
        hasReferral: !!referredById,
      },
    });

    // ========================================
    // 14. SEND VERIFICATION EMAIL
    // ========================================
    // TODO: Implement email sending
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${emailVerificationToken}`;
    
    console.log('📧 Email verification link:', verificationLink);

    // In production, use SendGrid/AWS SES/Resend:
    // await sendVerificationEmail(user.email, verificationLink);

    // ========================================
    // 15. RETURN SUCCESS RESPONSE
    // ========================================
    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully! Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          referralCode: user.referralCode,
        },
        bonuses: {
          piReceived: referredById ? 5 : 2,
          referredBy: referrerName,
        },
        nextStep: {
          action: 'verify_email',
          message: 'Check your email for verification link',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // ========================================
    // ERROR HANDLING
    // ========================================
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json(
        {
          error: firstError.message,
          field: firstError.path.join('.'),
          allErrors: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('Signup error:', error);

    await AuditLogger.logSecurityEvent({
      action: 'signup_error',
      success: false,
      failureReason: error instanceof Error ? error.message : 'Unknown error',
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json(
      {
        error: 'An error occurred during registration. Please try again.',
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : 'Unknown error'
            : undefined,
      },
      { status: 500 }
    );
  }
}
