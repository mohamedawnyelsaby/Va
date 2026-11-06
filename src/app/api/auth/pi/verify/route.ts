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
import { Prisma } from '@prisma/client';
import { captureException, captureMessage } from '@/lib/monitoring/sentry';

// ============================================
// CONFIGURATION & CONSTANTS
// ============================================

import { logger } from '@/lib/logger';
import { checkRateLimit, getClientId } from '@/lib/rate-limit';
import {
  getVerifiedToken,
  rememberVerifiedToken,
} from '@/lib/pi-network/verified-token-cache';

// ============================================
// SECURITY UTILITIES
// ============================================

// ============================================
// MAIN VERIFICATION HANDLER
// ============================================

// Pi's /v2/me can take up to ~17 s in the worst case (8 s timeout + 1 retry);
// don't let the platform default cut the function off first.
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const limited = await checkRateLimit(request, 'piVerify');
  if (limited) {return limited;}

  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  const clientIp = getClientId(request);

  try {
    logger.log(`[${requestId}] 🔐 Pi verification request from ${clientIp}`);

    // Parse and validate request body
    const body = await request.json();
    const { accessToken, uid } = body;

    // Input validation
    if (!accessToken || typeof accessToken !== 'string') {
      logger.warn(`[${requestId}] ⚠️ Missing or invalid accessToken`);
      return NextResponse.json(
        { error: 'Invalid access token format' },
        { status: 400 }
      );
    }

    if (!uid || typeof uid !== 'string') {
      logger.warn(`[${requestId}] ⚠️ Missing or invalid uid`);
      return NextResponse.json(
        { error: 'Invalid user identifier format' },
        { status: 400 }
      );
    }

    // Check token cache for performance optimization
    const cached = getVerifiedToken(accessToken, uid);
    if (cached) {
      logger.log(`[${requestId}] ⚡ Cache hit for ${uid}`);
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
    logger.log(`[${requestId}] 🌐 Verifying with Pi Platform...`);
    const piUser = await verifyPiUser(accessToken);

    // Critical security check: UID must match
    if (piUser.uid !== uid) {
      logger.error(`[${requestId}] 🚨 SECURITY ALERT: UID mismatch! Expected: ${uid}, Got: ${piUser.uid}`);
      captureMessage(
        `SECURITY ALERT: Pi UID mismatch - requestId=${requestId}, expected=${uid}, received=${piUser.uid}`,
        'error'
      );
      
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

    logger.log(`[${requestId}] ✅ Pi Platform verification successful`);

    // A deactivated account must not be touched or logged as a success.
    const existing = await prisma.user.findUnique({
      where: { piWalletId: piUser.uid },
      select: { isActive: true },
    });
    if (existing && existing.isActive === false) {
      logger.warn(`[${requestId}] ⛔ Verification refused: account is inactive`);
      return NextResponse.json({ error: 'Account is not active' }, { status: 403 });
    }

    // Database transaction for atomic user creation/update
    const user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Upsert user with optimistic locking
      const updatedUser = await tx.user.upsert({
        where: { piWalletId: piUser.uid },
        update: {
          piUsername: piUser.username,
          updatedAt: new Date(),
        },
        create: {
          email: `${piUser.uid}@pi.network`,
          piWalletId: piUser.uid,
          piUsername: piUser.username,
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
    rememberVerifiedToken(accessToken, piUser.uid, piUser.username);

    const duration = Date.now() - startTime;
    logger.log(`[${requestId}] 🎉 Verification completed in ${duration}ms`);

    return NextResponse.json(
      {
        verified: true,
        cached: false,
        user: {
          uid: piUser.uid,
          username: piUser.username,
          id: user.id,
        },
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
    logger.error(`[${requestId}] ❌ Verification failed after ${duration}ms:`, error);
    // A token Pi rejected (401) or Pi being down (503) are expected outcomes,
    // not application bugs: don't page Sentry for them.
    const isExpectedFailure =
      error instanceof Error &&
      (error.message === 'Invalid Pi access token' || error.message === 'Pi service unavailable');
    if (!isExpectedFailure) {
      captureException(error instanceof Error ? error : new Error(String(error)), { requestId });
    }

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
      logger.error(`[${requestId}] ❌ Failed to log error:`, logError);
    }

    // Determine appropriate error response
    if (error instanceof Error) {
      if (error.message.includes('Invalid Pi access token')) {
        return NextResponse.json(
          { error: 'Invalid Pi Network access token', requestId },
          { status: 401 }
        );
      }

      if (error.message === 'Pi service unavailable') {
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
  // Intentionally minimal: no cache size / TTL / backend details.
  return NextResponse.json({ service: 'Pi Verification', status: 'healthy' });
}

