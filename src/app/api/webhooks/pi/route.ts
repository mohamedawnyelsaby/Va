// ============================================
// PI NETWORK WEBHOOK HANDLER - PRODUCTION READY
// Enterprise-grade webhook processing with complete security
// ============================================
// Path: app/api/webhooks/pi/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

// ============================================
// CONFIGURATION
// ============================================

const PI_SECRET = process.env.PI_SECRET_KEY;
const WEBHOOK_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// ============================================
// TYPES
// ============================================

interface PiWebhookPayload {
  event: 'payment_completed' | 'payment_cancelled' | 'payment_failed';
  payment: {
    identifier: string;
    user_uid: string;
    amount: number;
    memo: string;
    metadata: Record<string, any>;
    from_address: string;
    to_address: string;
    direction: 'user_to_app' | 'app_to_user';
    network: 'Pi Network' | 'Pi Testnet';
    transaction?: {
      txid: string;
      verified: boolean;
      _link: string;
    };
    created_at: string;
  };
}

// ============================================
// SIGNATURE VERIFICATION
// ============================================

function verifyPiSignature(
  body: string,
  signature: string,
  timestamp: string
): boolean {
  try {
    if (!PI_SECRET) {
      console.error('❌ PI_SECRET not configured');
      return false;
    }

    // Create payload for verification
    const payload = `${timestamp}.${body}`;
    
    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', PI_SECRET)
      .update(payload)
      .digest('hex');

    // Timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('❌ Signature verification failed:', error);
    return false;
  }
}

// ============================================
// WEBHOOK HANDLER
// ============================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    console.log(`[${requestId}] 📥 Pi webhook received`);

    // ========================================
    // 1. EXTRACT AND VALIDATE HEADERS
    // ========================================
    const signature = request.headers.get('x-pi-signature');
    const timestamp = request.headers.get('x-pi-timestamp');

    if (!signature || !timestamp) {
      console.error(`[${requestId}] ❌ Missing required headers`);
      
      await logSecurityEvent({
        action: 'webhook_missing_headers',
        success: false,
        metadata: { requestId },
      });

      return NextResponse.json(
        { error: 'Missing required headers' },
        { status: 400 }
      );
    }

    // ========================================
    // 2. READ REQUEST BODY
    // ========================================
    const body = await request.text();

    if (!body) {
      console.error(`[${requestId}] ❌ Empty request body`);
      return NextResponse.json(
        { error: 'Empty body' },
        { status: 400 }
      );
    }

    // ========================================
    // 3. VERIFY SIGNATURE
    // ========================================
    const isValidSignature = verifyPiSignature(body, signature, timestamp);

    if (!isValidSignature) {
      console.error(`[${requestId}] ❌ Invalid signature`);
      
      await logSecurityEvent({
        action: 'webhook_invalid_signature',
        success: false,
        metadata: {
          requestId,
          timestamp,
          bodyLength: body.length,
        },
      });

      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // ========================================
    // 4. PREVENT REPLAY ATTACKS
    // ========================================
    const timestampAge = Date.now() - parseInt(timestamp);
    
    if (timestampAge > WEBHOOK_TIMEOUT) {
      console.error(`[${requestId}] ❌ Webhook too old: ${timestampAge}ms`);
      
      await logSecurityEvent({
        action: 'webhook_replay_attempt',
        success: false,
        metadata: { requestId, timestampAge },
      });

      return NextResponse.json(
        { error: 'Webhook expired' },
        { status: 400 }
      );
    }

    // ========================================
    // 5. PARSE PAYLOAD
    // ========================================
    let payload: PiWebhookPayload;
    
    try {
      payload = JSON.parse(body);
    } catch (error) {
      console.error(`[${requestId}] ❌ Invalid JSON`);
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      );
    }

    console.log(`[${requestId}] 📦 Event: ${payload.event}`);
    console.log(`[${requestId}] 💳 Payment ID: ${payload.payment.identifier}`);

    // ========================================
    // 6. IDEMPOTENCY CHECK
    // ========================================
    const existingLog = await prisma.auditLog.findFirst({
      where: {
        action: 'pi_webhook_processed',
        entityType: 'payment',
        entityId: payload.payment.identifier,
        changes: {
          contains: payload.event,
        },
      },
    });

    if (existingLog) {
      console.log(`[${requestId}] ⚠️ Duplicate webhook - already processed`);
      return NextResponse.json({ 
        success: true, 
        message: 'Already processed',
        requestId,
      });
    }

    // ========================================
    // 7. PROCESS EVENT
    // ========================================
    let result;

    switch (payload.event) {
      case 'payment_completed':
        result = await handlePaymentCompleted(payload, requestId);
        break;

      case 'payment_cancelled':
        result = await handlePaymentCancelled(payload, requestId);
        break;

      case 'payment_failed':
        result = await handlePaymentFailed(payload, requestId);
        break;

      default:
        console.warn(`[${requestId}] ⚠️ Unknown event type: ${payload.event}`);
        return NextResponse.json(
          { error: 'Unknown event type' },
          { status: 400 }
        );
    }

    // ========================================
    // 8. LOG SUCCESS
    // ========================================
    const duration = Date.now() - startTime;

    await prisma.auditLog.create({
      data: {
        action: 'pi_webhook_processed',
        entityType: 'payment',
        entityId: payload.payment.identifier,
        changes: JSON.stringify({
          event: payload.event,
          result,
          processingTime: duration,
          requestId,
        }),
      },
    });

    console.log(`[${requestId}] ✅ Successfully processed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      requestId,
      processingTime: duration,
      result,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error(`[${requestId}] ❌ Webhook processing error:`, error);

    await logSecurityEvent({
      action: 'webhook_processing_error',
      success: false,
      metadata: {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        processingTime: duration,
      },
    });

    return NextResponse.json(
      { 
        error: 'Internal server error',
        requestId,
      },
      { status: 500 }
    );
  }
}

// ============================================
// EVENT HANDLERS
// ============================================

/**
 * Handle payment_completed event
 * Updates payment, booking, and credits cashback
 */
async function handlePaymentCompleted(
  payload: PiWebhookPayload,
  requestId: string
) {
  const { payment } = payload;

  console.log(`[${requestId}] 💰 Processing completed payment`);

  // Find payment in database
  const dbPayment = await prisma.payment.findFirst({
    where: {
      piPaymentId: payment.identifier,
    },
    include: {
      booking: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          piBalance: true,
        },
      },
    },
  });

  if (!dbPayment) {
    console.error(`[${requestId}] ❌ Payment not found in database`);
    throw new Error(`Payment not found: ${payment.identifier}`);
  }

  // Verify transaction exists and is verified
  if (!payment.transaction?.txid || !payment.transaction?.verified) {
    console.error(`[${requestId}] ❌ Transaction not verified`);
    throw new Error('Transaction not verified by Pi Network');
  }

  // Update payment status
  await prisma.payment.update({
    where: { id: dbPayment.id },
    data: {
      status: 'completed',
      piTxid: payment.transaction.txid,
      metadata: {
        ...(dbPayment.metadata as object),
        completedAt: new Date().toISOString(),
        transaction: payment.transaction,
        network: payment.network,
        webhookRequestId: requestId,
      },
    },
  });

  console.log(`[${requestId}] ✅ Payment updated to completed`);

  // Update booking if exists
  if (dbPayment.booking) {
    await prisma.booking.update({
      where: { id: dbPayment.booking.id },
      data: {
        status: 'confirmed',
        paymentStatus: 'paid',
      },
    });

    console.log(`[${requestId}] ✅ Booking confirmed: ${dbPayment.booking.bookingCode}`);
  }

  // Calculate and credit cashback (2% of payment amount)
  const cashbackAmount = payment.amount * 0.02;
  
  await prisma.user.update({
    where: { id: dbPayment.userId },
    data: {
      piBalance: {
        increment: cashbackAmount,
      },
    },
  });

  console.log(`[${requestId}] 🎁 Cashback credited: ${cashbackAmount.toFixed(7)} Pi`);

  return {
    paymentId: dbPayment.id,
    bookingId: dbPayment.booking?.id,
    bookingCode: dbPayment.booking?.bookingCode,
    cashbackAmount,
    txid: payment.transaction.txid,
  };
}

/**
 * Handle payment_cancelled event
 * Updates payment and booking status
 */
async function handlePaymentCancelled(
  payload: PiWebhookPayload,
  requestId: string
) {
  const { payment } = payload;

  console.log(`[${requestId}] ❌ Processing cancelled payment`);

  const dbPayment = await prisma.payment.findFirst({
    where: {
      piPaymentId: payment.identifier,
    },
    include: {
      booking: true,
    },
  });

  if (!dbPayment) {
    console.warn(`[${requestId}] ⚠️ Payment not found`);
    return { status: 'not_found' };
  }

  // Update payment
  await prisma.payment.update({
    where: { id: dbPayment.id },
    data: {
      status: 'cancelled',
      metadata: {
        ...(dbPayment.metadata as object),
        cancelledAt: new Date().toISOString(),
        cancelReason: 'user_cancelled',
        webhookRequestId: requestId,
      },
    },
  });

  // Update booking
  if (dbPayment.booking) {
    await prisma.booking.update({
      where: { id: dbPayment.booking.id },
      data: {
        status: 'cancelled',
        paymentStatus: 'failed',
      },
    });

    console.log(`[${requestId}] 📝 Booking cancelled`);
  }

  return {
    paymentId: dbPayment.id,
    bookingId: dbPayment.booking?.id,
    status: 'cancelled',
  };
}

/**
 * Handle payment_failed event
 * Marks payment and booking as failed
 */
async function handlePaymentFailed(
  payload: PiWebhookPayload,
  requestId: string
) {
  const { payment } = payload;

  console.log(`[${requestId}] ⚠️ Processing failed payment`);

  const dbPayment = await prisma.payment.findFirst({
    where: {
      piPaymentId: payment.identifier,
    },
    include: {
      booking: true,
    },
  });

  if (!dbPayment) {
    console.warn(`[${requestId}] ⚠️ Payment not found`);
    return { status: 'not_found' };
  }

  // Update payment
  await prisma.payment.update({
    where: { id: dbPayment.id },
    data: {
      status: 'failed',
      errorMessage: 'Payment failed on Pi Network',
      metadata: {
        ...(dbPayment.metadata as object),
        failedAt: new Date().toISOString(),
        webhookRequestId: requestId,
      },
    },
  });

  // Update booking
  if (dbPayment.booking) {
    await prisma.booking.update({
      where: { id: dbPayment.booking.id },
      data: {
        status: 'cancelled',
        paymentStatus: 'failed',
      },
    });
  }

  return {
    paymentId: dbPayment.id,
    bookingId: dbPayment.booking?.id,
    status: 'failed',
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Log security events
 */
async function logSecurityEvent(data: {
  action: string;
  success: boolean;
  metadata?: Record<string, any>;
}) {
  try {
    await prisma.securityLog.create({
      data: {
        action: data.action,
        success: data.success,
        ipAddress: 'pi-network-webhook',
        userAgent: 'Pi Platform Webhook',
        metadata: data.metadata,
      },
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// ============================================
// METHOD RESTRICTIONS
// ============================================

export async function GET() {
  return NextResponse.json(
    { 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests from Pi Network',
      allowedMethods: ['POST'],
    },
    { 
      status: 405,
      headers: {
        'Allow': 'POST',
      },
    }
  );
}

export async function PUT() {
  return GET();
}

export async function DELETE() {
  return GET();
}

export async function PATCH() {
  return GET();
}
