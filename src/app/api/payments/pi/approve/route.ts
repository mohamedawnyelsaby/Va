// src/app/api/payments/pi/approve/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { approvePayment, getPayment } from '@/lib/pi-network/platform-api';

export async function POST(request: NextRequest) {
  try {
    const { paymentId, piPaymentId } = await request.json();

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });

    if (!payment || payment.status !== 'pending') {
      return NextResponse.json({ error: 'Invalid payment state' }, { status: 400 });
    }

    const piPayment = await getPayment(piPaymentId);

    if (Math.abs(piPayment.amount - payment.amount) > 0.0001) {
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    await approvePayment(piPaymentId);

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        piPaymentId,
        status: 'approved',
        approvedAt: new Date(),
      },
    });

    await prisma.booking.update({
      where: { id: payment.bookingId! },
      data: { paymentStatus: 'processing' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Approve Pi payment error:', error);
    return NextResponse.json({ error: 'Failed to approve payment' }, { status: 500 });
  }
}
