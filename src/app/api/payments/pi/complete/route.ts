// src/app/api/payments/pi/complete/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { completePayment } from '@/lib/pi-network/platform-api';

export async function POST(request: NextRequest) {
  try {
    const { paymentId, piPaymentId, txid } = await request.json();

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });

    if (!payment || payment.status !== 'approved') {
      return NextResponse.json({ error: 'Invalid payment state' }, { status: 400 });
    }

    await completePayment(piPaymentId, txid);

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'completed',
        piTxid: txid,
        completedAt: new Date(),
      },
    });

    await prisma.booking.update({
      where: { id: payment.bookingId! },
      data: {
        status: 'confirmed',
        paymentStatus: 'paid',
      },
    });

    return NextResponse.json({
      success: true,
      bookingId: payment.bookingId,
    });
  } catch (error) {
    console.error('Complete Pi payment error:', error);
    return NextResponse.json({ error: 'Failed to complete payment' }, { status: 500 });
  }
}
