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

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { captureException } from '@/lib/monitoring/sentry';
import { toPiAmount } from '@/lib/pricing';

const bodySchema = z.object({ bookingId: z.string().min(1).max(64) });

export async function POST(request: NextRequest) {
  const limited = await checkRateLimit(request, 'payment');
  if (limited) {return limited;}

  try {
    const guard = await requireUser();
    if ('response' in guard) {return guard.response;}
    const { userId } = guard;

    const { bookingId } = bodySchema.parse(await request.json());

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
    if (booking.status !== 'pending' || booking.paymentStatus !== 'unpaid') {
      return NextResponse.json(
        { error: 'This booking cannot be paid in its current state' },
        { status: 409 }
      );
    }
    if (booking.payments.some((p: { status: string }) => ['approved', 'completed'].includes(p.status))) {
      return NextResponse.json({ error: 'Booking already paid' }, { status: 400 });
    }

    const paymentAmount = toPiAmount(booking.totalPrice, booking.currency);
    if (!(paymentAmount > 0)) {
      return NextResponse.json({ error: 'Nothing to pay for this booking' }, { status: 400 });
    }

    const memo = `Va Travel - ${booking.itemName}`.slice(0, 100);

    // Reuse a not-yet-linked pending payment for this booking.
    const reusable = booking.payments.find((p: { status: string; piPaymentId: string | null }) => p.status === 'pending' && !p.piPaymentId);
    const payment = reusable
      ? await prisma.payment.update({
          where: { id: reusable.id },
          data: {
            amount: paymentAmount,
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
