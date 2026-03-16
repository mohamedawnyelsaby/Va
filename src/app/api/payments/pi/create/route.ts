// src/app/api/payments/pi/create/route.ts — FIXED
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // ✅ نفس pattern الـ bookings — لو مفيش session نستخدم userId من الـ booking
    let userId = session?.user?.id;

    const { bookingId, amount, memo } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId required' }, { status: 400 });
    }

    // جيب الـ booking عشان نعرف الـ userId
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // ✅ لو مفيش session، خد userId من الـ booking نفسه
    if (!userId) {
      userId = booking.userId;
    }

    // تحقق إن المستخدم هو صاحب الحجز
    if (booking.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // منع الدفع المكرر
    const existingPayment = booking.payments.find(p =>
      ['approved', 'completed'].includes(p.status)
    );
    if (existingPayment) {
      return NextResponse.json({ error: 'Booking already paid' }, { status: 400 });
    }

    const paymentAmount = amount || booking.totalPrice;
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
