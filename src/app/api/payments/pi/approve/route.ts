// src/app/api/payments/pi/approve/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db';
import { approvePayment, getPayment } from '@/lib/pi-network/platform-api';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { paymentId, piPaymentId } = await request.json();

    const payment = await prisma.payment.findUnique({ where: { id: paymentId }, include: { booking: true } });
    if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    if (payment.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const piPayment = await getPayment(piPaymentId);

    // Amount verification
    if (Math.abs(piPayment.amount - payment.amount) > 0.0001) {
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    await approvePayment(piPaymentId);

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        piPaymentId,
        status: 'approved',
        metadata: { ...(payment.metadata as object), approvedAt: new Date().toISOString(), piPaymentData: piPayment },
      },
    });

    // Update booking status
    if (payment.bookingId) await prisma.booking.update({ where: { id: payment.bookingId }, data: { paymentStatus: 'processing' } });

    return NextResponse.json({ success: true, paymentId: updatedPayment.id, status: 'approved' });
  } catch (error) {
    console.error('Approve Pi payment error:', error);
    return NextResponse.json({ error: 'Failed to approve payment', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
