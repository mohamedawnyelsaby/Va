// src/app/api/payments/pi/complete/route.ts
//
// Server-side completion of a Pi payment (Pi SDK: onReadyForServerCompletion).
//
// SECURITY FIXES
// - The payment is re-fetched from Pi and must match our record (amount,
//   linked piPaymentId, metadata reference) and the client-supplied txid must
//   equal the transaction Pi recorded. Before, the txid was trusted.
// - REMOVED the sandbox shortcuts that treated Pi error responses 400/409 —
//   and a missing PI_API_KEY — as a successful payment. Completion now needs
//   Pi to genuinely confirm, in every environment.
// - Completion is atomic and idempotent (see lib/payments/finalize.ts):
//   concurrent / repeated calls (and the webhook) can no longer credit the
//   cashback more than once.
// - Error details are no longer echoed to the client.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { captureException } from '@/lib/monitoring/sentry';
import { getPayment, completePayment } from '@/lib/pi-network/platform-api';
import { finalizePayment } from '@/lib/payments/finalize';
import { CASHBACK_RATE, roundPi } from '@/lib/pricing';

const AMOUNT_TOLERANCE = 1e-6;

const bodySchema = z.object({
  paymentId: z.string().min(1).max(64),
  piPaymentId: z.string().min(10).max(200).optional(),
  txid: z.string().min(1).max(200),
});

export async function POST(request: NextRequest) {
  const limited = await checkRateLimit(request, 'payment');
  if (limited) {return limited;}

  const requestId = crypto.randomUUID();

  const guard = await requireUser();
  if ('response' in guard) {return guard.response;}
  const { userId } = guard;

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request', requestId }, { status: 400 });
  }
  const { paymentId, txid } = body;

  try {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found', requestId }, { status: 404 });
    }
    if (payment.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden', requestId }, { status: 403 });
    }

    const expectedCashback = roundPi(payment.amount * CASHBACK_RATE);

    // Idempotency
    if (payment.status === 'completed') {
      if (payment.piTxid && payment.piTxid !== txid) {
        return NextResponse.json({ error: 'Payment completed with different txid', requestId }, { status: 409 });
      }
      return NextResponse.json({
        success: true,
        alreadyCompleted: true,
        paymentId: payment.id,
        bookingId: payment.bookingId,
        txid,
        amount: payment.amount,
        cashback: expectedCashback,
        requestId,
      });
    }

    if (payment.status !== 'approved' || !payment.piPaymentId) {
      return NextResponse.json(
        { error: `Cannot complete payment in '${payment.status}' state. Must be approved first.`, requestId },
        { status: 409 }
      );
    }
    if (body.piPaymentId && body.piPaymentId !== payment.piPaymentId) {
      return NextResponse.json({ error: 'Pi payment mismatch', requestId }, { status: 409 });
    }

    // ---- Verify against Pi's own record ---------------------------------
    let piPayment;
    try {
      piPayment = await getPayment(payment.piPaymentId);
    } catch (err) {
      logger.error(`[${requestId}] Pi getPayment failed:`, err instanceof Error ? err.message : err);
      return NextResponse.json({ error: 'Could not verify payment with Pi Network', requestId }, { status: 502 });
    }

    const referencedPaymentId = (piPayment.metadata as { paymentId?: string } | undefined)?.paymentId;
    const problems: string[] = [];
    if (Math.abs(piPayment.amount - payment.amount) > AMOUNT_TOLERANCE) {problems.push('amount mismatch');}
    if (referencedPaymentId !== payment.id) {problems.push('payment reference mismatch');}
    if (piPayment.status?.cancelled || piPayment.status?.user_cancelled) {problems.push('payment cancelled');}
    if (!piPayment.status?.developer_approved) {problems.push('not approved on Pi');}
    if (!piPayment.transaction?.txid) {problems.push('no transaction recorded yet');}
    else if (piPayment.transaction.txid !== txid) {problems.push('txid mismatch');}

    if (problems.length > 0) {
      logger.warn(`[${requestId}] Completion rejected: ${problems.join(', ')}`);
      return NextResponse.json({ error: 'Payment verification failed', requestId }, { status: 400 });
    }

    // ---- Complete on Pi (skip if Pi already has it completed) ------------
    if (!piPayment.status.developer_completed) {
      try {
        await completePayment(payment.piPaymentId, txid);
      } catch (err) {
        let completedNow = false;
        try {
          completedNow = Boolean((await getPayment(payment.piPaymentId)).status?.developer_completed);
        } catch {
          /* fall through */
        }
        if (!completedNow) {
          captureException(err instanceof Error ? err : new Error(String(err)), {
            requestId,
            paymentId: payment.id,
          });
          return NextResponse.json({ error: 'Pi Network completion failed. Please try again.', requestId }, { status: 502 });
        }
      }
    }

    // ---- Persist exactly once -------------------------------------------
    let result;
    try {
      result = await finalizePayment({
        paymentId: payment.id,
        txid,
        requestId,
        allowedFrom: ['approved'],
        source: 'client',
      });
    } catch (err) {
      if (err instanceof Error && err.message === 'TXID_ALREADY_USED') {
        return NextResponse.json({ error: 'Transaction already used', requestId }, { status: 409 });
      }
      throw err;
    }

    return NextResponse.json({
      success: true,
      alreadyCompleted: !result.finalized,
      paymentId: payment.id,
      piPaymentId: payment.piPaymentId,
      txid,
      status: 'completed',
      bookingId: payment.bookingId,
      amount: payment.amount,
      cashback: expectedCashback,
      message: `Payment completed! You earned ${expectedCashback} Pi cashback.`,
      requestId,
    });
  } catch (error) {
    logger.error(`[${requestId}] complete error:`, error);
    captureException(error instanceof Error ? error : new Error(String(error)), { requestId });
    return NextResponse.json({ error: 'Payment completion failed', requestId }, { status: 500 });
  }
}
