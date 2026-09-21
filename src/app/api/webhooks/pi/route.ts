// src/app/api/webhooks/pi/route.ts
//
// FIXES
// - payment_completed now goes through finalizePayment(): the payment is
//   finished ONCE. Before, this handler credited cashback again even when
//   /api/payments/pi/complete had already done it (double cashback), computed
//   it from the webhook payload instead of our own record, and could be
//   replayed.
// - The payload amount must match our stored amount.
// - cancelled / failed events can no longer overwrite a payment that is
//   already completed (or a booking that is already paid).
// - A non-numeric timestamp no longer bypasses the replay window.
// - Uses the shared verifyPiSignature (was duplicated).
// NOTE: pi-app.json currently has an empty paymentWebhookUrl, so this handler
// only runs if you configure the webhook in the Pi Developer Portal.

import type { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { verifyPiSignature } from '@/lib/pi-network/platform-api';
import { finalizePayment } from '@/lib/payments/finalize';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const WEBHOOK_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const AMOUNT_TOLERANCE = 1e-6;

interface PiWebhookPayment {
  identifier: string;
  amount: number;
  transaction?: {
    txid: string;
    verified: boolean;
  };
}

interface PiWebhookPayload {
  event: string;
  payment: PiWebhookPayment;
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    const signature = request.headers.get('x-pi-signature');
    const timestamp = request.headers.get('x-pi-timestamp');

    if (!signature || !timestamp) {
      return NextResponse.json({ error: 'Missing headers' }, { status: 400 });
    }

    const body = await request.text();
    if (!body) {
      return NextResponse.json({ error: 'Empty body' }, { status: 400 });
    }

    if (!verifyPiSignature(body, signature, timestamp)) {
      logger.error(`[${requestId}] ❌ Invalid webhook signature`);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Replay protection: the timestamp must be numeric and recent.
    const timestampMs = Number.parseInt(timestamp, 10);
    if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > WEBHOOK_TIMEOUT) {
      return NextResponse.json({ error: 'Webhook expired or invalid timestamp' }, { status: 400 });
    }

    const payload = JSON.parse(body) as PiWebhookPayload;
    const { event, payment } = payload;

    if (!payment?.identifier || typeof payment.identifier !== 'string') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    logger.log(`[${requestId}] 📦 Event: ${event} payment=${payment.identifier}`);

    // Duplicate delivery guard (finalizePayment is itself idempotent too).
    const existingLog = await prisma.auditLog.findFirst({
      where: {
        action: 'pi_webhook_processed',
        entityType: 'payment',
        entityId: payment.identifier,
        changes: { contains: `"event":"${event}"` },
      },
    });
    if (existingLog) {
      return NextResponse.json({ success: true, message: 'Already processed', requestId });
    }

    let result;
    switch (event) {
      case 'payment_completed':
        result = await handlePaymentCompleted(payment, requestId);
        break;
      case 'payment_cancelled':
        result = await handlePaymentClosed(payment, 'cancelled');
        break;
      case 'payment_failed':
        result = await handlePaymentClosed(payment, 'failed');
        break;
      default:
        return NextResponse.json({ error: 'Unknown event' }, { status: 400 });
    }

    const duration = Date.now() - startTime;
    await prisma.auditLog.create({
      data: {
        action: 'pi_webhook_processed',
        entityType: 'payment',
        entityId: payment.identifier,
        changes: JSON.stringify({ event, result, processingTime: duration, requestId }),
      },
    });

    return NextResponse.json({ success: true, requestId, processingTime: duration, result });
  } catch (error) {
    logger.error(`[${requestId}] ❌ Webhook error:`, error);
    return NextResponse.json({ error: 'Internal error', requestId }, { status: 500 });
  }
}

async function handlePaymentCompleted(payment: PiWebhookPayment, requestId: string) {
  const dbPayment = await prisma.payment.findFirst({
    where: { piPaymentId: payment.identifier },
    select: { id: true, amount: true, bookingId: true },
  });
  if (!dbPayment) {
    throw new Error('Payment not found');
  }

  if (!payment.transaction?.txid || !payment.transaction?.verified) {
    throw new Error('Transaction not verified');
  }
  if (Math.abs(payment.amount - dbPayment.amount) > AMOUNT_TOLERANCE) {
    throw new Error('Amount mismatch');
  }

  const result = await finalizePayment({
    paymentId: dbPayment.id,
    txid: payment.transaction.txid,
    requestId,
    allowedFrom: ['pending', 'approved'],
    source: 'webhook',
  });

  return {
    paymentId: dbPayment.id,
    bookingId: dbPayment.bookingId,
    finalized: result.finalized,
    cashback: result.cashback,
  };
}

/** payment_cancelled / payment_failed: never touches a completed payment. */
async function handlePaymentClosed(payment: PiWebhookPayment, status: 'cancelled' | 'failed') {
  const dbPayment = await prisma.payment.findFirst({
    where: { piPaymentId: payment.identifier },
    select: { id: true, bookingId: true },
  });
  if (!dbPayment) {
    return { status: 'not_found' };
  }

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const updated = await tx.payment.updateMany({
      where: { id: dbPayment.id, status: { in: ['pending', 'approved'] } },
      data: {
        status,
        ...(status === 'failed' ? { errorMessage: 'Payment failed' } : {}),
      },
    });

    if (updated.count > 0 && dbPayment.bookingId) {
      await tx.booking.updateMany({
        where: { id: dbPayment.bookingId, paymentStatus: { not: 'paid' } },
        data: { status: 'cancelled', paymentStatus: 'failed' },
      });
    }

    return { paymentId: dbPayment.id, status: updated.count > 0 ? status : 'unchanged' };
  });
}

// Block other HTTP methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405, headers: { Allow: 'POST' } });
}
