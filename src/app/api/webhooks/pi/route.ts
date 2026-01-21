// src/app/api/webhooks/pi/route.ts
// ✅ PRODUCTION-READY PI WEBHOOK HANDLER

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

// Force dynamic route (no caching)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PI_SECRET = process.env.PI_SECRET_KEY;
const WEBHOOK_TIMEOUT = 5 * 60 * 1000; // 5 minutes

/**
 * Verify Pi Network webhook signature
 */
function verifyPiSignature(body: string, signature: string, timestamp: string): boolean {
  try {
    if (!PI_SECRET) {
      console.error('❌ PI_SECRET not configured');
      return false;
    }

    const payload = `${timestamp}.${body}`;
    const expectedSignature = crypto
      .createHmac('sha256', PI_SECRET)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('❌ Signature verification failed:', error);
    return false;
  }
}

/**
 * POST /api/webhooks/pi
 * Handle Pi Network payment webhooks
 */
export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    console.log(`[${requestId}] 📥 Pi webhook received`);

    // 1. Get headers
    const signature = request.headers.get('x-pi-signature');
    const timestamp = request.headers.get('x-pi-timestamp');

    if (!signature || !timestamp) {
      console.error(`[${requestId}] ❌ Missing headers`);
      return NextResponse.json({ error: 'Missing headers' }, { status: 400 });
    }

    // 2. Read body
    const body = await request.text();
    if (!body) {
      console.error(`[${requestId}] ❌ Empty body`);
      return NextResponse.json({ error: 'Empty body' }, { status: 400 });
    }

    // 3. Verify signature
    if (!verifyPiSignature(body, signature, timestamp)) {
      console.error(`[${requestId}] ❌ Invalid signature`);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 4. Check timestamp (prevent replay attacks)
    const timestampAge = Date.now() - parseInt(timestamp);
    if (timestampAge > WEBHOOK_TIMEOUT) {
      console.error(`[${requestId}] ❌ Webhook too old`);
      return NextResponse.json({ error: 'Webhook expired' }, { status: 400 });
    }

    // 5. Parse payload
    const payload = JSON.parse(body);
    const { event, payment } = payload;

    console.log(`[${requestId}] 📦 Event: ${event}`);
    console.log(`[${requestId}] 💳 Payment ID: ${payment.identifier}`);

    // 6. Check for duplicate processing
    const existingLog = await prisma.auditLog.findFirst({
      where: {
        action: 'pi_webhook_processed',
        entityType: 'payment',
        entityId: payment.identifier,
      },
    });

    if (existingLog) {
      console.log(`[${requestId}] ⚠️ Duplicate webhook - already processed`);
      return NextResponse.json({ 
        success: true, 
        message: 'Already processed',
        requestId 
      });
    }

    // 7. Process event
    let result;

    switch (event) {
      case 'payment_completed':
        result = await handlePaymentCompleted(payment, requestId);
        break;

      case 'payment_cancelled':
        result = await handlePaymentCancelled(payment, requestId);
        break;

      case 'payment_failed':
        result = await handlePaymentFailed(payment, requestId);
        break;

      default:
        console.warn(`[${requestId}] ⚠️ Unknown event: ${event}`);
        return NextResponse.json({ error: 'Unknown event' }, { status: 400 });
    }

    // 8. Log success
    const duration = Date.now() - startTime;
    await prisma.auditLog.create({
      data: {
        action: 'pi_webhook_processed',
        entityType: 'payment',
        entityId: payment.identifier,
        changes: JSON.stringify({
          event,
          result,
          processingTime: duration,
          requestId,
        }),
      },
    });

    console.log(`[${requestId}] ✅ Processed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      requestId,
      processingTime: duration,
      result,
    });

  } catch (error) {
    console.error(`[${requestId}] ❌ Webhook error:`, error);
    return NextResponse.json(
      { error: 'Internal error', requestId },
      { status: 500 }
    );
  }
}

/**
 * Handle payment_completed event
 */
async function handlePaymentCompleted(payment: any, requestId: string) {
  console.log(`[${requestId}] 💰 Processing completed payment`);

  const dbPayment = await prisma.payment.findFirst({
    where: { piPaymentId: payment.identifier },
    include: { booking: true, user: true },
  });

  if (!dbPayment) {
    throw new Error('Payment not found');
  }

  // Verify transaction
  if (!payment.transaction?.txid || !payment.transaction?.verified) {
    throw new Error('Transaction not verified');
  }

  // Update payment
  await prisma.payment.update({
    where: { id: dbPayment.id },
    data: {
      status: 'completed',
      piTxid: payment.transaction.txid,
      metadata: {
        ...(dbPayment.metadata as object),
        completedAt: new Date().toISOString(),
        transaction: payment.transaction,
      },
    },
  });

  // Update booking
  if (dbPayment.booking) {
    await prisma.booking.update({
      where: { id: dbPayment.booking.id },
      data: {
        status: 'confirmed',
        paymentStatus: 'paid',
      },
    });
  }

  // Credit cashback (2%)
  const cashback = payment.amount * 0.02;
  await prisma.user.update({
    where: { id: dbPayment.userId },
    data: { piBalance: { increment: cashback } },
  });

  console.log(`[${requestId}] 🎁 Cashback: ${cashback} Pi`);

  return {
    paymentId: dbPayment.id,
    bookingId: dbPayment.booking?.id,
    cashback,
    txid: payment.transaction.txid,
  };
}

/**
 * Handle payment_cancelled event
 */
async function handlePaymentCancelled(payment: any, requestId: string) {
  console.log(`[${requestId}] ❌ Processing cancelled payment`);

  const dbPayment = await prisma.payment.findFirst({
    where: { piPaymentId: payment.identifier },
    include: { booking: true },
  });

  if (!dbPayment) {
    return { status: 'not_found' };
  }

  await prisma.payment.update({
    where: { id: dbPayment.id },
    data: { status: 'cancelled' },
  });

  if (dbPayment.booking) {
    await prisma.booking.update({
      where: { id: dbPayment.booking.id },
      data: { status: 'cancelled', paymentStatus: 'failed' },
    });
  }

  return { paymentId: dbPayment.id, status: 'cancelled' };
}

/**
 * Handle payment_failed event
 */
async function handlePaymentFailed(payment: any, requestId: string) {
  console.log(`[${requestId}] ⚠️ Processing failed payment`);

  const dbPayment = await prisma.payment.findFirst({
    where: { piPaymentId: payment.identifier },
    include: { booking: true },
  });

  if (!dbPayment) {
    return { status: 'not_found' };
  }

  await prisma.payment.update({
    where: { id: dbPayment.id },
    data: { status: 'failed', errorMessage: 'Payment failed' },
  });

  if (dbPayment.booking) {
    await prisma.booking.update({
      where: { id: dbPayment.booking.id },
      data: { status: 'cancelled', paymentStatus: 'failed' },
    });
  }

  return { paymentId: dbPayment.id, status: 'failed' };
}

// Block other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}
