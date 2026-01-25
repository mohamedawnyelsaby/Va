// src/app/api/payments/pi/complete/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db';
import { completePayment } from '@/lib/pi-network/platform-api';
import { sendBookingConfirmation, sendPaymentConfirmation } from '@/lib/email/notifications';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { paymentId, piPaymentId, txid } = await request.json();

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: { include: { hotel: true, attraction: true, restaurant: true } }, user: true },
    });

    if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    if (payment.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await completePayment(piPaymentId, txid);

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        piTxid: txid,
        status: 'completed',
        metadata: { ...(payment.metadata as object), completedAt: new Date().toISOString(), txid },
      },
    });

    // Update booking
    if (payment.booking) {
      await prisma.booking.update({
        where: { id: payment.booking.id },
        data: { status: 'confirmed', paymentStatus: 'paid' },
      });
    }

    // 2% cashback
    const cashback = payment.amount * 0.02;
    await prisma.user.update({ where: { id: session.user.id }, data: { piBalance: { increment: cashback } } });

    // Send emails
    if (payment.user.email && payment.booking) {
      const booking = payment.booking;
      const itemName = booking.hotel?.name || booking.attraction?.name || booking.restaurant?.name || 'Unknown';

      await sendBookingConfirmation({
        bookingId: booking.id,
        userEmail: payment.user.email,
        userName: payment.user.name || 'Traveler',
        hotelName: itemName,
        checkIn: booking.checkInDate?.toISOString() || booking.startDate.toISOString(),
        checkOut: booking.checkOutDate?.toISOString() || booking.endDate?.toISOString() || '',
        guests: booking.guests,
        totalAmount: payment.amount,
        currency: payment.currency,
        confirmationNumber: booking.bookingCode,
      });

      await sendPaymentConfirmation({
        paymentId: payment.id,
        userEmail: payment.user.email,
        userName: payment.user.name || 'Traveler',
        amount: payment.amount,
        currency: payment.currency,
        piTxid: txid,
        status: 'completed',
        bookingId: booking.id,
      });
    }

    return NextResponse.json({ success: true, paymentId: updatedPayment.id, bookingId: payment.bookingId, cashback, txid });
  } catch (error) {
    console.error('Complete Pi payment error:', error);
    return NextResponse.json({ error: 'Failed to complete payment', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
