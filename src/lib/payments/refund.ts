// src/lib/payments/refund.ts
//
// Refund workflow for completed Pi payments.
//
//   user requests (bookings PATCH)  -> payment.refundRequestedAt / refundReason
//   support reviews (admin API)     -> processRefund() or markRefundedManually()
//   result                          -> payment 'completed' -> 'refunded',
//                                      refundedAt / refundTxid / refundedBy,
//                                      booking 'refunded', PaymentEvent + AuditLog
//
// Safety rules
// - Only a 'completed' payment with a recorded request, and not already
//   refunded or being processed, is eligible.
// - A refund can be sent ONCE: a DB claim (refundProcessingAt) is taken
//   atomically before any money moves.
// - If sending fails BEFORE anything reached the chain the claim is released.
//   If Pi were already sent (A2UPostSubmitError) the claim is KEPT and the
//   txid recorded, so nothing is ever sent twice.

import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { A2UPostSubmitError, sendA2UPayment } from '@/lib/pi-network/a2u';
import { validateMemo, validatePaymentAmount } from '@/lib/pi-network/platform-api';
import { transitionPayment } from '@/lib/payments/state-machine';

export interface RefundCandidate {
  status: string;
  amount: number;
  piTxid: string | null;
  refundRequestedAt: Date | null;
  refundProcessingAt: Date | null;
  refundedAt: Date | null;
}

/** Returns a human-readable reason it is NOT eligible, or null when it is. */
export function refundIneligibleReason(p: RefundCandidate): string | null {
  if (p.status === 'refunded' || p.refundedAt) {return 'Already refunded';}
  if (p.status !== 'completed') {return `Only completed payments can be refunded (status: ${p.status})`;}
  if (!p.piTxid) {return 'Payment has no confirmed transaction';}
  if (!p.refundRequestedAt) {return 'No refund was requested for this payment';}
  if (p.refundProcessingAt) {return 'A refund is already being processed';}
  if (!validatePaymentAmount(p.amount)) {return 'Invalid payment amount';}
  return null;
}

export class RefundError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'RefundError';
  }
}

const refundSelect = {
  id: true, userId: true, bookingId: true, status: true, amount: true, piTxid: true,
  refundRequestedAt: true, refundProcessingAt: true, refundedAt: true,
  user: { select: { piWalletId: true } },
  booking: { select: { bookingCode: true } },
} as const;

async function audit(adminId: string, action: string, paymentId: string, changes: object) {
  await prisma.auditLog
    .create({
      data: { userId: adminId, action, entityType: 'payment', entityId: paymentId, changes: JSON.stringify(changes) },
    })
    .catch((e: unknown) => logger.error('[refund] audit log write failed:', e));
}

async function markRefunded(
  paymentId: string,
  bookingId: string | null,
  adminId: string,
  txid: string,
  amount: number,
  how: 'a2u' | 'manual',
  note?: string
) {
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const moved = await transitionPayment(tx, {
      paymentId,
      from: ['completed'],
      to: 'refunded',
      actor: `admin:${adminId}`,
      reason: how === 'a2u' ? 'Refund sent via App-to-User payment' : `Refund sent manually${note ? `: ${note}` : ''}`,
      data: { refundedAt: new Date(), refundTxid: txid, refundAmount: amount, refundedBy: adminId },
      metadata: { txid, how },
    });
    if (!moved) {throw new RefundError('Payment is no longer refundable', 409);}
    if (bookingId) {
      await tx.booking.updateMany({
        where: { id: bookingId },
        data: { status: 'refunded', paymentStatus: 'refunded' },
      });
    }
  });
}

/** Support sends the refund from the Pi Wallet by hand and records the txid here. */
export async function markRefundedManually(params: { paymentId: string; adminId: string; txid: string; note?: string }) {
  const { paymentId, adminId, txid, note } = params;
  if (!txid || txid.length < 8 || txid.length > 200) {throw new RefundError('A valid txid is required', 400);}

  const p = await prisma.payment.findUnique({ where: { id: paymentId }, select: refundSelect });
  if (!p) {throw new RefundError('Payment not found', 404);}
  const why = refundIneligibleReason({ ...p, refundProcessingAt: null });
  if (why) {throw new RefundError(why, 409);}

  const reused = await prisma.payment.findFirst({ where: { refundTxid: txid }, select: { id: true } });
  if (reused) {throw new RefundError('This txid was already used for another refund', 409);}

  await markRefunded(p.id, p.bookingId, adminId, txid, p.amount, 'manual', note);
  await audit(adminId, 'refund_marked_manual', p.id, { txid, note });
  return { paymentId: p.id, status: 'refunded' as const, txid };
}

/** Automatic App-to-User refund. Disabled unless REFUNDS_AUTO_SEND=true. */
export async function processRefund(params: { paymentId: string; adminId: string }) {
  const { paymentId, adminId } = params;

  if (process.env.REFUNDS_AUTO_SEND !== 'true') {
    throw new RefundError('Automatic refunds are disabled. Send manually and use mark_manual.', 503);
  }

  const p = await prisma.payment.findUnique({ where: { id: paymentId }, select: refundSelect });
  if (!p) {throw new RefundError('Payment not found', 404);}
  const why = refundIneligibleReason(p);
  if (why) {throw new RefundError(why, 409);}
  if (!p.user.piWalletId) {throw new RefundError('User has no Pi wallet id on file', 409);}

  const memo = `Va Travel refund ${p.booking?.bookingCode ?? p.id}`.slice(0, 100);
  if (!validateMemo(memo)) {throw new RefundError('Invalid memo', 400);}

  // Atomic claim: exactly one caller proceeds to move money.
  const claim = await prisma.payment.updateMany({
    where: { id: p.id, status: 'completed', refundProcessingAt: null, refundedAt: null },
    data: { refundProcessingAt: new Date() },
  });
  if (claim.count === 0) {throw new RefundError('A refund is already being processed', 409);}

  try {
    const sent = await sendA2UPayment({
      uid: p.user.piWalletId,
      amount: p.amount,
      memo,
      metadata: { type: 'refund', paymentId: p.id },
    });
    await markRefunded(p.id, p.bookingId, adminId, sent.txid, p.amount, 'a2u');
    await audit(adminId, 'refund_sent_a2u', p.id, { txid: sent.txid, identifier: sent.identifier, network: sent.network });
    return { paymentId: p.id, status: 'refunded' as const, txid: sent.txid };
  } catch (err) {
    if (err instanceof A2UPostSubmitError) {
      // Money moved. KEEP the claim so it can never be sent twice; leave a loud trail.
      logger.error(`[refund] SENT BUT NOT CLOSED payment=${p.id} txid=${err.txid} identifier=${err.identifier}`);
      await prisma.paymentEvent
        .create({
          data: {
            paymentId: p.id, fromStatus: 'completed', toStatus: 'completed', actor: `admin:${adminId}`,
            reason: 'REFUND SENT ON-CHAIN but /complete failed. Complete on Pi by hand, then use mark_manual.',
            metadata: { txid: err.txid, identifier: err.identifier },
          },
        })
        .catch(() => undefined);
      await audit(adminId, 'refund_sent_needs_manual_close', p.id, { txid: err.txid, identifier: err.identifier });
      throw new RefundError(`Refund was sent (txid ${err.txid}) but could not be closed on Pi. Use mark_manual with this txid.`, 502);
    }
    // Nothing reached the chain: release the claim so it can be retried.
    await prisma.payment.updateMany({ where: { id: p.id, refundedAt: null }, data: { refundProcessingAt: null } });
    await audit(adminId, 'refund_send_failed', p.id, { error: err instanceof Error ? err.message : String(err) });
    throw new RefundError('Refund could not be sent; nothing was transferred. You can retry.', 502);
  }
}
