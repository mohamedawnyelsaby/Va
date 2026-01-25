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

    const { bookingId, amount, memo } = await request.json();

    // Validate booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true },
    });

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    if (booking.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Prevent double payments
    const existingPayment = booking.payments.find(p => ['approved', 'completed'].includes(p.status));
    if (existingPayment) return NextResponse.json({ error: 'Booking already paid' }, { status: 400 });

    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        bookingId,
        amount,
        currency: 'PI',
        method: 'pi_network',
        status: 'pending',
        metadata: { memo, createdAt: new Date().toISOString() },
      },
    });

    return NextResponse.json({ paymentId: payment.id, amount, memo, bookingId });
  } catch (error) {
    console.error('Create Pi payment error:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
