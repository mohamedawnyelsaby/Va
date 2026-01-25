// src/app/api/payments/pi/create/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await request.json();

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true },
    });

    if (!booking || booking.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (booking.status !== 'pending') {
      return NextResponse.json({ error: 'Invalid booking state' }, { status: 400 });
    }

    const alreadyPaid = booking.payments.some(
      (p) => p.status === 'approved' || p.status === 'completed'
    );

    if (alreadyPaid) {
      return NextResponse.json({ error: 'Booking already paid' }, { status: 400 });
    }

    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        bookingId: booking.id,
        amount: booking.totalPrice,
        currency: 'PI',
        method: 'pi_network',
        status: 'pending',
        memo: `Booking #${booking.id}`,
      },
    });

    return NextResponse.json({
      paymentId: payment.id,
      amount: payment.amount,
      memo: payment.memo,
    });
  } catch (error) {
    console.error('Create Pi payment error:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
