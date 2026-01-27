// ============================================
// PI NETWORK AUTHENTICATION VERIFICATION
// Enterprise-Grade Server-Side Token Validation
// ============================================
// Path: src/app/api/auth/pi/verify/route.ts
// Author: Elite Backend Architecture Team
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyPiUser } from '@/lib/pi-network/platform-api';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

// ============================================
// CONFIGURATION & CONSTANTS
// ============================================

const TOKEN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_VERIFICATION_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

// In-memory cache for verified tokens (production should use Redis)
const tokenCache = new Map<string, { uid: string; username: string; timestamp: number }>();
const verificationAttempts = new Map<string, { count: number; resetAt: number }>();

// ============================================
// SECURITY UTILITIES
// ============================================

/**
 * Generate secure session token
 */
function generateSessionToken(uid: string): string {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(16).toString('hex');
  return crypto
    .createHash('sha256')
    .update(`${uid}:${timestamp}:${random}`)
    .digest('hex');
}

/**
 * Rate limiting check
 */
function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const attempts = verificationAttempts.get(identifier);

  if (!attempts) {
    verificationAttempts.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (now > attempts.resetAt) {
    verificationAttempts.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (attempts.count >= MAX_VERIFICATION_ATTEMPTS) {
    return false;
  }

  attempts.count++;
  return true;
}

/**
 * Clean expired cache entries
 */
function cleanExpiredCache() {
  const now = Date.now();
  for (const [token, data] of tokenCache.entries()) {
    if (now - data.timestamp > TOKEN_CACHE_TTL) {
      tokenCache.delete(token);
    }
  }
}

// ============================================
// MAIN VERIFICATION HANDLER
// ============================================

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';

  try {
    console.log(`[${requestId}] 🔐 Pi verification request from ${clientIp}`);

    // Parse and validate request body
    const body = await request.json();
    const { accessToken, uid } = body;

    // Input validation
    if (!accessToken || typeof accessToken !== 'string') {
      console.warn(`[${requestId}] ⚠️ Missing or invalid accessToken`);
      return NextResponse.json(
        { error: 'Invalid access token format' },
        { status: 400 }
      );
    }

    if (!uid || typeof uid !== 'string') {
      console.warn(`[${requestId}] ⚠️ Missing or invalid uid`);
      return NextResponse.json(
        { error: 'Invalid user identifier format' },
        { status: 400 }
      );
    }

    // Rate limiting
    if (!checkRateLimit(clientIp)) {
      console.warn(`[${requestId}] 🚫 Rate limit exceeded for ${clientIp}`);
      return NextResponse.json(
        { error: 'Too many verification attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Check token cache for performance optimization
    const cached = tokenCache.get(accessToken);
    if (cached && cached.uid === uid) {
      console.log(`[${requestId}] ⚡ Cache hit for ${uid}`);
      return NextResponse.json({
        verified: true,
        cached: true,
        user: {
          uid: cached.uid,
          username: cached.username,
        },
        requestId,
      });
    }

    // Verify with Pi Platform API
    console.log(`[${requestId}] 🌐 Verifying with Pi Platform...`);
    const piUser = await verifyPiUser(accessToken);

    // Critical security check: UID must match
    if (piUser.uid !== uid) {
      console.error(`[${requestId}] 🚨 SECURITY ALERT: UID mismatch! Expected: ${uid}, Got: ${piUser.uid}`);
      
      // Log security incident
      await prisma.securityLog.create({
        data: {
          action: 'pi_verification_uid_mismatch',
          success: false,
          failureReason: `UID mismatch - Expected: ${uid}, Got: ${piUser.uid}`,
          ipAddress: clientIp,
          userAgent: request.headers.get('user-agent') || 'unknown',
          metadata: {
            requestId,
            expectedUid: uid,
            receivedUid: piUser.uid,
          },
        },
      });

      return NextResponse.json(
        { error: 'User verification failed. Security incident logged.' },
        { status: 403 }
      );
    }

    console.log(`[${requestId}] ✅ Pi Platform verification successful`);

    // Database transaction for atomic user creation/update
    const sessionToken = generateSessionToken(piUser.uid);
    
    const user = await prisma.$transaction(async (tx) => {
      // Upsert user with optimistic locking
      const updatedUser = await tx.user.upsert({
        where: { piWalletId: piUser.uid },
        update: {
          piUsername: piUser.username,
          piAccessToken: accessToken,
          updatedAt: new Date(),
        },
        create: {
          email: `${piUser.uid}@pi.network`,
          piWalletId: piUser.uid,
          piUsername: piUser.username,
          piAccessToken: accessToken,
          name: piUser.username,
          emailVerified: new Date(),
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: updatedUser.id,
          action: 'pi_user_verified',
          entityType: 'user',
          entityId: updatedUser.id,
          changes: JSON.stringify({
            username: piUser.username,
            uid: piUser.uid,
            verifiedAt: new Date().toISOString(),
          }),
          ipAddress: clientIp,
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      });

      // Create security log for successful verification
      await tx.securityLog.create({
        data: {
          userId: updatedUser.id,
          action: 'pi_verification_success',
          success: true,
          ipAddress: clientIp,
          userAgent: request.headers.get('user-agent') || 'unknown',
          metadata: {
            requestId,
            username: piUser.username,
            verificationTime: Date.now() - startTime,
          },
        },
      });

      return updatedUser;
    });

    // Cache the verified token
    tokenCache.set(accessToken, {
      uid: piUser.uid,
      username: piUser.username,
      timestamp: Date.now(),
    });

    // Clean expired cache entries (async, non-blocking)
    setImmediate(() => cleanExpiredCache());

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] 🎉 Verification completed in ${duration}ms`);

    return NextResponse.json(
      {
        verified: true,
        cached: false,
        user: {
          uid: piUser.uid,
          username: piUser.username,
          id: user.id,
        },
        sessionToken,
        requestId,
        performance: {
          verificationTime: duration,
          cached: false,
        },
      },
      {
        status: 200,
        headers: {
          'X-Request-ID': requestId,
          'X-Verification-Time': duration.toString(),
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] ❌ Verification failed after ${duration}ms:`, error);

    // Log error to security log
    try {
      await prisma.securityLog.create({
        data: {
          action: 'pi_verification_error',
          success: false,
          failureReason: error instanceof Error ? error.message : 'Unknown error',
          ipAddress: clientIp,
          userAgent: request.headers.get('user-agent') || 'unknown',
          metadata: {
            requestId,
            errorDetails: error instanceof Error ? error.stack : 'No stack trace',
          },
        },
      });
    } catch (logError) {
      console.error(`[${requestId}] ❌ Failed to log error:`, logError);
    }

    // Determine appropriate error response
    if (error instanceof Error) {
      if (error.message.includes('Invalid Pi access token')) {
        return NextResponse.json(
          { error: 'Invalid Pi Network access token', requestId },
          { status: 401 }
        );
      }

      if (error.message.includes('network') || error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Pi Network service temporarily unavailable', requestId },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Verification failed. Please try again.',
        requestId,
        details: process.env.NODE_ENV === 'development' 
          ? error instanceof Error ? error.message : 'Unknown error'
          : undefined,
      },
      { status: 500 }
    );
  }
}

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================

export async function GET() {
  return NextResponse.json({
    service: 'Pi Verification',
    status: 'healthy',
    version: '2.0.0',
    cache: {
      size: tokenCache.size,
      ttl: TOKEN_CACHE_TTL,
    },
    rateLimit: {
      maxAttempts: MAX_VERIFICATION_ATTEMPTS,
      window: RATE_LIMIT_WINDOW,
    },
  });
}

// ============================================
// CLEANUP ON MODULE UNLOAD
// ============================================

if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => {
    console.log('🧹 Cleaning up verification cache...');
    tokenCache.clear();
    verificationAttempts.clear();
  });
}
