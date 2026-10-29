// src/app/api/payments/pi/create/route.ts
//
// Creates the internal Payment row for a booking.
// - Requires a real session and ownership of the booking.
// - The amount is derived ONLY from the booking stored in the database
//   (converted to Pi on the server). Neither `amount` nor `memo` is read from
//   the request body.
// - A booking that is cancelled, already paid, or free cannot be paid.
// - Calling this twice for the same booking reuses the pending payment
//   instead of piling up duplicates.
// - Optional `Idempotency-Key` header: the same key (per user + booking)
//   always returns the same payment, so a retried request can never create a
//   second financial record.
// - A booking with a created / approved / completed payment can't get another.
// - Defence in depth: the database enforces ONE active payment per booking
//   (partial unique index, prisma/manual-migrations/004); a lost race
//   surfaces as P2002 and is answered with the winner instead of a 500.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { captureException } from '@/lib/monitoring/sentry';
import { toPiAmount } from '@/lib/pricing';
import { validateMemo, validatePaymentAmount } from '@/lib/pi-network/platform-api';
import { isActiveStatus } from '@/lib/payments/state-machine';

const bodySchema = z.object({ bookingId: z.string().min(1).max(64) });
const IDEMPOTENCY_KEY = /^[A-Za-z0-9_-]{8,100}$/;

function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2002';
}

export async function POST(request: NextRequest) {
  const limited = await checkRateLimit(request, 'payment');
  if (limited) {return limited;}

  try {
    const guard = await requireUser();
    if ('response' in guard) {return guard.response;}
    const { userId } = guard;

    const { bookingId } = bodySchema.parse(await request.json());

    const rawKey = request.headers.get('idempotency-key');
    if (rawKey !== null && !IDEMPOTENCY_KEY.test(rawKey)) {
      return NextResponse.json({ error: 'Invalid Idempotency-Key' }, { status: 400 });
    }
    // Scoped to the user so keys can't collide or be probed across accounts.
    const idempotencyKey = rawKey ? `${userId}:${bookingId}:${rawKey}` : null;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    if (booking.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Replay of an earlier request with the same key: same answer, no new row.
    if (idempotencyKey) {
      const replay = booking.payments.find(
        (p: { idempotencyKey?: string | null }) => p.idempotencyKey === idempotencyKey
      );
      if (replay) {
        const meta = (replay.metadata ?? {}) as { memo?: string };
        return NextResponse.json({
          paymentId: replay.id,
          amount: replay.amount,
          memo: meta.memo ?? `Va Travel - ${booking.itemName}`.slice(0, 100),
          bookingId,
          replayed: true,
        });
      }
    }

    if (booking.status !== 'pending' || booking.paymentStatus !== 'unpaid') {
      return NextResponse.json(
        { error: 'This booking cannot be paid in its current state' },
        { status: 409 }
      );
    }
    // Only a still-unlinked 'pending' payment may be reused; any other active
    // payment (created / approved / completed) means this booking is taken.
    if (
      booking.payments.some(
        (p: { status: string }) => isActiveStatus(p.status) && p.status !== 'pending'
      )
    ) {
      return NextResponse.json({ error: 'Booking already has an active payment' }, { status: 409 });
    }

    const paymentAmount = toPiAmount(booking.totalPrice, booking.currency);
    if (!(paymentAmount > 0) || !validatePaymentAmount(paymentAmount)) {
      return NextResponse.json({ error: 'Nothing to pay for this booking' }, { status: 400 });
    }

    const memo = `Va Travel - ${booking.itemName}`.slice(0, 100);
    if (!validateMemo(memo)) {
      return NextResponse.json({ error: 'Invalid payment memo' }, { status: 400 });
    }

    // Reuse a not-yet-linked pending payment for this booking.
    const reusable = booking.payments.find((p: { status: string; piPaymentId: string | null; idempotencyKey?: string | null }) => p.status === 'pending' && !p.piPaymentId);
    const payment = reusable
      ? await prisma.payment.update({
          where: { id: reusable.id },
          data: {
            amount: paymentAmount,
            ...(idempotencyKey && !reusable.idempotencyKey ? { idempotencyKey } : {}),
            metadata: {
              memo,
              createdAt: new Date().toISOString(),
              fiatAmount: booking.totalPrice,
              fiatCurrency: booking.currency,
            },
          },
        })
      : await prisma.payment.create({
          data: {
            userId,
            bookingId,
            amount: paymentAmount,
            currency: 'PI',
            method: 'pi_network',
            status: 'pending',
            ...(idempotencyKey ? { idempotencyKey } : {}),
            metadata: {
              memo,
              createdAt: new Date().toISOString(),
              fiatAmount: booking.totalPrice,
              fiatCurrency: booking.currency,
            },
          },
        });

    return NextResponse.json({
      paymentId: payment.id,
      amount: paymentAmount,
      memo,
      bookingId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    if (isUniqueViolation(error)) {
      // Lost a race against another request for the same booking / key.
      return NextResponse.json(
        { error: 'A payment for this booking is already in progress' },
        { status: 409 }
      );
    }
    if (error instanceof Error && error.message.startsWith('PI_PER_')) {
      // Missing conversion rate for this currency: surfaced loudly so it gets
      // fixed immediately, and the user gets a clear reason instead of a
      // generic 500.
      logger.error('Create Pi payment error: missing conversion rate:', error.message);
      captureException(error, { context: 'payments/pi/create - missing PI_PER_ rate' });
      return NextResponse.json(
        { error: 'Pi payments are temporarily unavailable for this currency. Please try again later.' },
        { status: 503 }
      );
    }
    console.error('Create Pi payment error:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
