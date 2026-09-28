// src/app/api/payments/pi/recover/route.ts
//
// Recovers a Pi payment the SDK reports as "incomplete" (Pi.authenticate's
// onIncompletePaymentFound callback fires when the user has a payment on
// the Pi side that was never finished — app closed mid-flow, network drop,
// etc). Before this endpoint existed, the client only stored the incomplete
// payment in local React state and never told the server about it, so:
//   - the payment could sit "approved" on Pi forever, blocking the user
//     from creating any new payment (Pi enforces one open payment at a time)
//   - if it HAD actually completed on the blockchain, the booking would
//     never be confirmed and the cashback never credited, with no way for
//     the user to recover it themselves.
//
// This asks Pi for the ground truth on that payment and drives it through
// the exact same finalize/cancel logic the normal complete route and the
// webhook use, so a payment is still only ever finalized once.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { captureException } from '@/lib/monitoring/sentry';
import { getPayment, cancelPayment } from '@/lib/pi-network/platform-api';
import { finalizePayment } from '@/lib/payments/finalize';

const bodySchema = z.object({ piPaymentId: z.string().min(10).max(200) });

export async function POST(request: NextRequest) {
  const limited = await checkRateLimit(request, 'payment');
  if (limited) {return limited;}

  const guard = await requireUser();
  if ('response' in guard) {return guard.response;}
  const { userId } = guard;

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const { piPaymentId } = body;

  try {
    // Ground truth comes from Pi, never from the client.
    let piPayment;
    try {
      piPayment = await getPayment(piPaymentId);
    } catch (err) {
      logger.error('[recover] Pi getPayment failed:', err instanceof Error ? err.message : err);
      return NextResponse.json({ error: 'Could not reach Pi Network' }, { status: 502 });
    }

    const referencedPaymentId = (piPayment.metadata as { paymentId?: string } | undefined)?.paymentId;

    // Find our internal record either by the id Pi's metadata points at, or
    // by a payment already linked to this piPaymentId.
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          ...(referencedPaymentId ? [{ id: referencedPaymentId }] : []),
          { piPaymentId },
        ],
      },
    });

    if (!payment || payment.userId !== userId) {
      // Nothing on our side to reconcile, or it belongs to someone else.
      // Still resolve it on Pi's side so it stops blocking the user's SDK
      // from creating new payments, but don't touch any booking/cashback.
      if (!piPayment.status?.developer_completed && !piPayment.status?.cancelled) {
        try {
          await cancelPayment(piPaymentId);
        } catch (err) {
          logger.warn('[recover] Could not cancel orphaned Pi payment:', err instanceof Error ? err.message : err);
        }
      }
      captureException(new Error('Incomplete Pi payment with no matching internal record'), {
        context: 'payments/pi/recover',
        piPaymentId,
        referencedPaymentId,
        userId,
      });
      return NextResponse.json({ success: true, resolved: 'orphaned', piPaymentId });
    }

    // Already settled on our side — nothing to do, just confirm.
    if (payment.status === 'completed') {
      return NextResponse.json({ success: true, resolved: 'already_completed', paymentId: payment.id });
    }
    if (payment.status === 'cancelled' || payment.status === 'failed') {
      return NextResponse.json({ success: true, resolved: payment.status, paymentId: payment.id });
    }

    // Pi says it was cancelled: mirror that locally and stop.
    if (piPayment.status?.cancelled || piPayment.status?.user_cancelled) {
      await prisma.payment.updateMany({
        where: { id: payment.id, status: { in: ['pending', 'approved'] } },
        data: { status: 'cancelled' },
      });
      if (payment.bookingId) {
        await prisma.booking.updateMany({
          where: { id: payment.bookingId, paymentStatus: { not: 'paid' } },
          data: { status: 'cancelled', paymentStatus: 'failed' },
        });
      }
      return NextResponse.json({ success: true, resolved: 'cancelled', paymentId: payment.id });
    }

    // Pi has a verified transaction: finalize exactly like /complete does.
    if (piPayment.transaction?.txid && piPayment.transaction?.verified) {
      const result = await finalizePayment({
        paymentId: payment.id,
        txid: piPayment.transaction.txid,
        requestId: `recover-${piPaymentId}`,
        allowedFrom: ['pending', 'approved'],
        source: 'webhook',
      });
      return NextResponse.json({
        success: true,
        resolved: 'finalized',
        paymentId: payment.id,
        finalized: result.finalized,
        cashback: result.cashback,
      });
    }

    // Not yet approved on Pi and no transaction: Pi never saw money move,
    // so it's safe to cancel and let the user try again cleanly.
    if (!piPayment.status?.developer_approved) {
      try {
        await cancelPayment(piPaymentId);
      } catch (err) {
        logger.warn('[recover] cancelPayment failed:', err instanceof Error ? err.message : err);
      }
      await prisma.payment.updateMany({
        where: { id: payment.id, status: 'pending' },
        data: { status: 'cancelled' },
      });
      return NextResponse.json({ success: true, resolved: 'cancelled_unapproved', paymentId: payment.id });
    }

    // Approved but no transaction yet (blockchain submission never
    // happened or hasn't confirmed) — leave it as approved. The user can
    // retry completion once Pi has a transaction, or this will be picked
    // up again next time the SDK reports it as incomplete.
    return NextResponse.json({ success: true, resolved: 'pending_transaction', paymentId: payment.id });
  } catch (error) {
    logger.error('[recover] error:', error);
    captureException(error instanceof Error ? error : new Error(String(error)), { context: 'payments/pi/recover' });
    return NextResponse.json({ error: 'Recovery failed' }, { status: 500 });
  }
}
