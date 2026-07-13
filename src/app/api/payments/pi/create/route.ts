// src/app/api/payments/pi/create/route.ts
// SECURITY FIX (2026-07-13): previously, when no session existed, the code
// pulled userId from the booking itself and then compared it to itself —
// a no-op check that let anyone who knew/guessed a bookingId create a
// payment under the real owner's account without ever logging in.
// Now: no valid session -> reject immediately. No exceptions.

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // ✅ FIX: no more "fallback to booking's userId when session is missing".
    // Without a real, verified session we reject outright.
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, memo } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId required' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Ownership check — now meaningful because userId came from a real session,
    // not from the booking row itself.
    if (booking.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Prevent duplicate payment
    const existingPayment = booking.payments.find(p =>
      ['approved', 'completed'].includes(p.status)
    );
    if (existingPayment) {
      return NextResponse.json({ error: 'Booking already paid' }, { status: 400 });
    }

    // ✅ FIX: amount is read exclusively from the booking record in the DB.
    // Previously the client-supplied `amount` was used if present, meaning a
    // caller could set their own price. We no longer read `amount` from the
    // request body at all.
    const paymentAmount = booking.totalPrice;
    const paymentMemo = memo || `Va Travel - ${booking.itemName}`;

    const payment = await prisma.payment.create({
      data: {
        userId,
        bookingId,
        amount: paymentAmount,
        currency: 'PI',
        method: 'pi_network',
        status: 'pending',
        metadata: {
          memo: paymentMemo,
          createdAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      paymentId: payment.id,
      amount: paymentAmount,
      memo: paymentMemo,
      bookingId,
    });
  } catch (error) {
    console.error('Create Pi payment error:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
