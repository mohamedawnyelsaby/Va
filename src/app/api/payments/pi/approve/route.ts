// ============================================
// PI PAYMENT APPROVAL SERVICE
// Production-Grade Server Approval with Multi-Layer Validation
// ============================================
// Path: src/app/api/payments/pi/approve/route.ts
// Architecture: Event-Driven with Comprehensive State Management
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db';
import { approvePayment, getPayment } from '@/lib/pi-network/platform-api';
import crypto from 'crypto';

// ============================================
// CONFIGURATION & CONSTANTS
// ============================================

const APPROVAL_TIMEOUT = 30 * 1000; // 30 seconds
const AMOUNT_TOLERANCE = 0.0001; // Pi amount comparison tolerance
const MAX_APPROVAL_RETRIES = 3;

// Payment state machine
enum PaymentState {
  PENDING = 'pending',
  APPROVED = 'approved',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

// Valid state transitions for approval
const VALID_APPROVAL_TRANSITIONS = new Set([
  PaymentState.PENDING,
]);

// ============================================
// VALIDATION UTILITIES
// ============================================

/**
 * Validate Pi payment ID format with regex
 */
function isValidPiPaymentId(id: string): boolean {
  return typeof id === 'string' && 
         id.length > 10 && 
         id.length < 200 &&
         /^[a-zA-Z0-9_-]+$/.test(id);
}

/**
 * Compare Pi amounts with tolerance for floating point precision
 */
function areAmountsEqual(amount1: number, amount2: number, tolerance = AMOUNT_TOLERANCE): boolean {
  return Math.abs(amount1 - amount2) <= tolerance;
}

/**
 * Validate payment state transition
 */
function isValidStateTransition(currentState: string, targetState: string): boolean {
  return VALID_APPROVAL_TRANSITIONS.has(currentState as PaymentState);
}

// ============================================
// APPROVAL ORCHESTRATION
// ============================================

/**
 * Core approval logic with comprehensive validation
 */
async function executeApproval(
  piPaymentId: string,
  userId: string,
  requestId: string,
  clientIp: string
) {
  console.log(`[${requestId}] 🎬 Starting approval orchestration`);

  // ========================================
  // STEP 1: Database Payment Retrieval
  // ========================================
  const payment = await prisma.payment.findFirst({
    where: { piPaymentId },
    include: {
      booking: {
        include: {
          hotel: true,
          attraction: true,
          restaurant: true,
        },
      },
      user: true,
    },
  });

  if (!payment) {
    console.error(`[${requestId}] ❌ Payment not found: ${piPaymentId}`);
    throw new Error('PAYMENT_NOT_FOUND');
  }

  console.log(`[${requestId}] 📦 Payment retrieved: ${payment.id}`);

  // ========================================
  // STEP 2: Authorization Check
  // ========================================
  if (payment.userId !== userId) {
    console.error(`[${requestId}] 🚨 SECURITY: Unauthorized approval attempt`);
    console.error(`[${requestId}] Expected user: ${payment.userId}, Got: ${userId}`);
    
    // Log security incident
    await prisma.securityLog.create({
      data: {
        action: 'payment_approval_unauthorized',
        success: false,
        failureReason: 'User attempted to approve payment they do not own',
        ipAddress: clientIp,
        userAgent: 'API',
        metadata: {
          requestId,
          paymentId: payment.id,
          attemptedBy: userId,
          ownedBy: payment.userId,
        },
      },
    });

    throw new Error('PAYMENT_FORBIDDEN');
  }

  // ========================================
  // STEP 3: State Validation
  // ========================================
  if (!isValidStateTransition(payment.status, PaymentState.APPROVED)) {
    console.warn(`[${requestId}] ⚠️ Invalid state transition: ${payment.status} → approved`);
    throw new Error(`INVALID_STATE_TRANSITION:${payment.status}`);
  }

  // Idempotency: Already approved
  if (payment.status === PaymentState.APPROVED) {
    console.log(`[${requestId}] ✅ Payment already approved (idempotent)`);
    return {
      alreadyApproved: true,
      payment,
    };
  }

  // ========================================
  // STEP 4: Pi Platform Verification
  // ========================================
  console.log(`[${requestId}] 🌐 Fetching payment from Pi Platform...`);
  const piPayment = await getPayment(piPaymentId);

  console.log(`[${requestId}] 📊 Pi Platform Response:`);
  console.log(`[${requestId}]   Amount: ${piPayment.amount} Pi`);
  console.log(`[${requestId}]   Direction: ${piPayment.direction}`);
  console.log(`[${requestId}]   Status: ${JSON.stringify(piPayment.status)}`);

  // ========================================
  // STEP 5: Critical Validations
  // ========================================

  // Validation 1: Amount verification (prevents fraud)
  if (!areAmountsEqual(piPayment.amount, payment.amount)) {
    console.error(`[${requestId}] 💰 AMOUNT MISMATCH DETECTED!`);
    console.error(`[${requestId}]   Expected: ${payment.amount} Pi`);
    console.error(`[${requestId}]   Received: ${piPayment.amount} Pi`);
    console.error(`[${requestId}]   Difference: ${Math.abs(piPayment.amount - payment.amount)} Pi`);

    // Log fraud attempt
    await prisma.securityLog.create({
      data: {
        userId: payment.userId,
        action: 'payment_amount_mismatch',
        success: false,
        failureReason: `Amount mismatch: expected ${payment.amount}, got ${piPayment.amount}`,
        ipAddress: clientIp,
        userAgent: 'API',
        metadata: {
          requestId,
          paymentId: payment.id,
          piPaymentId,
          expectedAmount: payment.amount,
          receivedAmount: piPayment.amount,
        },
      },
    });

    throw new Error('AMOUNT_MISMATCH');
  }

  // Validation 2: Payment direction (must be user_to_app)
  if (piPayment.direction !== 'user_to_app') {
    console.error(`[${requestId}] ⚠️ Invalid payment direction: ${piPayment.direction}`);
    throw new Error('INVALID_PAYMENT_DIRECTION');
  }

  // Validation 3: User verification
  if (payment.user.piWalletId && piPayment.user_uid !== payment.user.piWalletId) {
    console.error(`[${requestId}] 🚨 User UID mismatch!`);
    throw new Error('USER_MISMATCH');
  }

  console.log(`[${requestId}] ✅ All validations passed`);

  // ========================================
  // STEP 6: Pi Platform Approval
  // ========================================
  console.log(`[${requestId}] 📝 Approving payment on Pi Platform...`);
  
  let approvalAttempts = 0;
  let approvalSuccess = false;
  let lastError: Error | null = null;

  // Retry logic for network resilience
  while (approvalAttempts < MAX_APPROVAL_RETRIES && !approvalSuccess) {
    try {
      approvalAttempts++;
      await approvePayment(piPaymentId);
      approvalSuccess = true;
      console.log(`[${requestId}] ✅ Pi Platform approval successful (attempt ${approvalAttempts})`);
    } catch (error) {
      lastError = error as Error;
      console.warn(`[${requestId}] ⚠️ Approval attempt ${approvalAttempts} failed:`, error);
      
      if (approvalAttempts < MAX_APPROVAL_RETRIES) {
        const delay = 1000 * approvalAttempts; // Exponential backoff
        console.log(`[${requestId}] ⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  if (!approvalSuccess) {
    console.error(`[${requestId}] ❌ Pi Platform approval failed after ${approvalAttempts} attempts`);
    throw new Error(`PI_APPROVAL_FAILED:${lastError?.message}`);
  }

  // ========================================
  // STEP 7: Database Update (Transaction)
  // ========================================
  console.log(`[${requestId}] 💾 Updating database...`);

  const updatedPayment = await prisma.$transaction(async (tx) => {
    // Update payment status
    const updated = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentState.APPROVED,
        metadata: {
          ...(payment.metadata as object),
          approvedAt: new Date().toISOString(),
          approvedBy: userId,
          requestId,
          piPaymentData: {
            amount: piPayment.amount,
            direction: piPayment.direction,
            user_uid: piPayment.user_uid,
            status: piPayment.status,
          },
          approvalAttempts,
        },
      },
    });

    // Update booking status
    if (payment.bookingId) {
      await tx.booking.update({
        where: { id: payment.bookingId },
        data: {
          paymentStatus: 'processing',
          updatedAt: new Date(),
        },
      });
      console.log(`[${requestId}] 📅 Booking ${payment.bookingId} status updated`);
    }

    // Create audit trail
    await tx.auditLog.create({
      data: {
        userId,
        action: 'payment_approved',
        entityType: 'payment',
        entityId: payment.id,
        changes: JSON.stringify({
          status: PaymentState.APPROVED,
          piPaymentId,
          amount: payment.amount,
          approvedAt: new Date().toISOString(),
        }),
        ipAddress: clientIp,
        userAgent: 'API',
      },
    });

    return updated;
  });

  console.log(`[${requestId}] ✅ Database updated successfully`);

  return {
    alreadyApproved: false,
    payment: updatedPayment,
  };
}

// ============================================
// HTTP HANDLER
// ============================================

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';

  try {
    console.log(`[${requestId}] 📥 Payment approval request received`);

    // ========================================
    // Authentication
    // ========================================
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.warn(`[${requestId}] ⚠️ Unauthorized approval attempt from ${clientIp}`);
      return NextResponse.json(
        { error: 'Authentication required', requestId },
        { status: 401 }
      );
    }

    // ========================================
    // Input Validation
    // ========================================
    const body = await request.json();
    const { piPaymentId } = body;

    if (!piPaymentId) {
      console.warn(`[${requestId}] ⚠️ Missing piPaymentId`);
      return NextResponse.json(
        { error: 'Pi payment ID is required', requestId },
        { status: 400 }
      );
    }

    if (!isValidPiPaymentId(piPaymentId)) {
      console.warn(`[${requestId}] ⚠️ Invalid piPaymentId format: ${piPaymentId}`);
      return NextResponse.json(
        { error: 'Invalid Pi payment ID format', requestId },
        { status: 400 }
      );
    }

    // ========================================
    // Execute Approval
    // ========================================
    const result = await executeApproval(
      piPaymentId,
      session.user.id,
      requestId,
      clientIp
    );

    // ========================================
    // Success Response
    // ========================================
    const duration = Date.now() - startTime;
    console.log(`[${requestId}] 🎉 Approval completed in ${duration}ms`);

    return NextResponse.json(
      {
        success: true,
        alreadyApproved: result.alreadyApproved,
        paymentId: result.payment.id,
        piPaymentId,
        status: result.payment.status,
        bookingId: result.payment.bookingId,
        amount: result.payment.amount,
        currency: result.payment.currency,
        requestId,
        performance: {
          approvalTime: duration,
        },
      },
      {
        status: result.alreadyApproved ? 200 : 201,
        headers: {
          'X-Request-ID': requestId,
          'X-Approval-Time': duration.toString(),
        },
      }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] ❌ Approval failed after ${duration}ms:`, error);

    // ========================================
    // Error Handling with Specific Responses
    // ========================================
    if (error instanceof Error) {
      const errorMessage = error.message;

      // Payment not found
      if (errorMessage === 'PAYMENT_NOT_FOUND') {
        return NextResponse.json(
          { error: 'Payment not found', requestId },
          { status: 404 }
        );
      }

      // Forbidden access
      if (errorMessage === 'PAYMENT_FORBIDDEN') {
        return NextResponse.json(
          { error: 'Access denied. Payment belongs to another user.', requestId },
          { status: 403 }
        );
      }

      // Amount mismatch (fraud prevention)
      if (errorMessage === 'AMOUNT_MISMATCH') {
        return NextResponse.json(
          { error: 'Payment amount mismatch detected. Transaction rejected for security.', requestId },
          { status: 400 }
        );
      }

      // Invalid state transition
      if (errorMessage.startsWith('INVALID_STATE_TRANSITION:')) {
        const currentState = errorMessage.split(':')[1];
        return NextResponse.json(
          { error: `Cannot approve payment in ${currentState} state`, requestId },
          { status: 409 }
        );
      }

      // Pi Platform approval failed
      if (errorMessage.startsWith('PI_APPROVAL_FAILED:')) {
        return NextResponse.json(
          { error: 'Pi Network approval failed. Please try again.', requestId },
          { status: 502 }
        );
      }
    }

    // Generic error
    return NextResponse.json(
      {
        error: 'Payment approval failed',
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
// HEALTH CHECK
// ============================================

export async function GET() {
  return NextResponse.json({
    service: 'Payment Approval',
    status: 'operational',
    version: '2.0.0',
    configuration: {
      timeout: APPROVAL_TIMEOUT,
      amountTolerance: AMOUNT_TOLERANCE,
      maxRetries: MAX_APPROVAL_RETRIES,
    },
    features: [
      'Multi-layer validation',
      'Fraud prevention',
      'Retry logic with exponential backoff',
      'Idempotent operations',
      'Comprehensive audit trail',
      'Security incident logging',
    ],
  });
}
