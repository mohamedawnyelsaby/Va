// src/lib/payments/reconcile.ts
//
// Drives ONE of our payments to a consistent end state using Pi's own record
// as the source of truth. Shared by:
//   - POST /api/payments/pi/recover   (the SDK reported an incomplete payment)
//   - GET  /api/cron/reconcile-payments (safety net for users who never come back)
//
// It makes the SAME checks /approve and /complete make (amount, reference,
// linkage, direction) and, like /complete, closes the payment on Pi
// (`developer_completed`) BEFORE persisting. Without that last step a payment
// could be 'completed' here yet stay "incomplete" on Pi, and Pi allows only one
// open payment per user, so they would be unable to pay again.

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { captureException } from '@/lib/monitoring/sentry';
import { cancelPayment, completePayment, getPayment } from '@/lib/pi-network/platform-api';
import type { PiPayment } from '@/lib/pi-network/platform-api';
import { finalizePayment } from '@/lib/payments/finalize';

const AMOUNT_TOLERANCE = 1e-6;

export interface ReconcilablePayment {
  id: string;
  bookingId: string | null;
  status: string;
  amount: number;
  piPaymentId: string | null;
}

export type ReconcileResult =
  | { resolved: 'already_completed' | 'cancelled' | 'failed' | 'cancelled_unapproved' | 'pending_transaction'; paymentId: string }
  | { resolved: 'finalized'; paymentId: string; finalized: boolean; cashback: number }
  /** Pi's record does not match ours; nothing was changed. */
  | { resolved: 'refused'; paymentId: string; problems: string[] }
  /** Pi did not accept our "complete" call; nothing was persisted. Retry later. */
  | { resolved: 'pi_completion_failed'; paymentId: string };

async function closeOnPi(
  piPaymentId: string,
  txid: string,
  context: Record<string, unknown>
): Promise<boolean> {
  try {
    await completePayment(piPaymentId, txid);
    return true;
  } catch (err) {
    // The call can fail even though Pi did record the completion; re-check.
    try {
      if ((await getPayment(piPaymentId)).status?.developer_completed) {return true;}
    } catch {
      /* fall through */
    }
    captureException(err instanceof Error ? err : new Error(String(err)), {
      context: 'payments/reconcile',
      ...context,
    });
    return false;
  }
}

export async function reconcilePiPayment(params: {
  payment: ReconcilablePayment;
  piPayment: PiPayment;
  piPaymentId: string;
  requestId: string;
  source: 'recover' | 'reconcile';
}): Promise<ReconcileResult> {
  const { payment, piPayment, piPaymentId, requestId, source } = params;

  const referencedPaymentId = (piPayment.metadata as { paymentId?: string } | undefined)?.paymentId;
  const txid = piPayment.transaction?.txid;
  const hasVerifiedTx = Boolean(txid && piPayment.transaction?.verified);
  const ctx = { paymentId: payment.id, piPaymentId, requestId };

  // Already settled on our side. If Pi still shows it open (an earlier
  // recover finalized without closing it), close it now so the user is not
  // blocked from creating a new payment.
  if (payment.status === 'completed') {
    if (
      hasVerifiedTx &&
      txid &&
      payment.piPaymentId === piPaymentId &&
      !piPayment.status?.developer_completed
    ) {
      await closeOnPi(piPaymentId, txid, ctx);
    }
    return { resolved: 'already_completed', paymentId: payment.id };
  }
  if (payment.status === 'cancelled' || payment.status === 'failed') {
    return { resolved: payment.status, paymentId: payment.id };
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
    return { resolved: 'cancelled', paymentId: payment.id };
  }

  // Pi has a verified transaction: verify it against OUR record, close it on
  // Pi, then persist exactly once.
  if (hasVerifiedTx && txid) {
    const problems: string[] = [];
    if (!payment.piPaymentId || payment.piPaymentId !== piPaymentId) {
      problems.push('payment not linked to this Pi payment');
    }
    if (referencedPaymentId !== payment.id) {problems.push('payment reference mismatch');}
    if (Math.abs(piPayment.amount - payment.amount) > AMOUNT_TOLERANCE) {
      problems.push('amount mismatch');
    }
    if (piPayment.direction && piPayment.direction !== 'user_to_app') {
      problems.push('wrong direction');
    }
    if (problems.length > 0) {
      logger.warn(`[reconcile] Refusing to finalize ${payment.id}: ${problems.join(', ')}`);
      captureException(new Error('Pi payment failed verification during reconcile'), {
        context: 'payments/reconcile',
        ...ctx,
        problems,
      });
      return { resolved: 'refused', paymentId: payment.id, problems };
    }

    if (!piPayment.status?.developer_completed) {
      const closed = await closeOnPi(piPaymentId, txid, ctx);
      if (!closed) {return { resolved: 'pi_completion_failed', paymentId: payment.id };}
    }

    try {
      const result = await finalizePayment({
        paymentId: payment.id,
        txid,
        requestId: `${source}-${piPaymentId}`,
        allowedFrom: ['pending', 'approved'],
        source,
      });
      return {
        resolved: 'finalized',
        paymentId: payment.id,
        finalized: result.finalized,
        cashback: result.cashback,
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'TXID_ALREADY_USED') {
        captureException(err, { context: 'payments/reconcile', ...ctx });
        return { resolved: 'refused', paymentId: payment.id, problems: ['transaction already used'] };
      }
      throw err;
    }
  }

  // Not yet approved on Pi and no transaction: Pi never saw money move, so
  // it is safe to cancel and let the user try again cleanly.
  if (!piPayment.status?.developer_approved) {
    try {
      await cancelPayment(piPaymentId);
    } catch (err) {
      logger.warn('[reconcile] cancelPayment failed:', err instanceof Error ? err.message : err);
    }
    await prisma.payment.updateMany({
      where: { id: payment.id, status: 'pending' },
      data: { status: 'cancelled' },
    });
    return { resolved: 'cancelled_unapproved', paymentId: payment.id };
  }

  // Approved but no transaction yet: leave it; a later pass picks it up.
  return { resolved: 'pending_transaction', paymentId: payment.id };
}
