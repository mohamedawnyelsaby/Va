// src/lib/payments/finalize.ts
// The ONE place where a payment becomes 'completed'.
//
// Used by both POST /api/payments/pi/complete and the Pi webhook, so a payment
// is finalised (booking confirmed + cashback credited) EXACTLY ONCE even when
// both fire, or when the same request is sent twice concurrently: the state
// transition is a single atomic `updateMany` guarded by the current status,
// and cashback is only credited by the caller whose update actually matched.

import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { CASHBACK_RATE, roundPi } from '@/lib/pricing';

export interface FinalizeResult {
  /** true only for the single caller that performed the transition */
  finalized: boolean;
  cashback: number;
}

export async function finalizePayment(params: {
  paymentId: string;
  txid: string;
  requestId: string;
  /** statuses the payment may be moved to 'completed' from */
  allowedFrom: string[];
  source: 'client' | 'webhook';
}): Promise<FinalizeResult> {
  const { paymentId, txid, requestId, allowedFrom, source } = params;

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // A txid can only ever settle ONE payment.
    const txidReused = await tx.payment.findFirst({
      where: { piTxid: txid, id: { not: paymentId } },
      select: { id: true },
    });
    if (txidReused) {
      throw new Error('TXID_ALREADY_USED');
    }

    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      select: { id: true, userId: true, bookingId: true, amount: true, metadata: true },
    });
    if (!payment) {
      throw new Error('PAYMENT_NOT_FOUND');
    }

    // Atomic compare-and-set. Only one concurrent caller can win this.
    const claimed = await tx.payment.updateMany({
      where: { id: paymentId, status: { in: allowedFrom } },
      data: { status: 'completed', piTxid: txid },
    });
    if (claimed.count === 0) {
      return { finalized: false, cashback: 0 };
    }

    const cashback = roundPi(payment.amount * CASHBACK_RATE);

    await tx.payment.update({
      where: { id: paymentId },
      data: {
        metadata: {
          ...((payment.metadata as object) || {}),
          completedAt: new Date().toISOString(),
          txid,
          cashback,
          requestId,
          completedVia: source,
        },
      },
    });

    if (payment.bookingId) {
      await tx.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'confirmed', paymentStatus: 'paid' },
      });
    }

    await tx.user.update({
      where: { id: payment.userId },
      data: { piBalance: { increment: cashback } },
    });

    return { finalized: true, cashback };
  });
}
