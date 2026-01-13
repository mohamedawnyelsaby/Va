// src/app/api/pi/complete/route.ts
// ✅ Server-Side Completion Endpoint

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { piBackend } from '@/lib/pi-network/backend';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const completeSchema = z.object({
  paymentId: z.string(),
  txid: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate input
    const body = await request.json();
    const { paymentId, txid } = completeSchema.parse(body);

    // 3. Get payment from database
    const payment = await prisma.payment.findUnique({
      where: { piPaymentId: paymentId },
      include: { user: true, booking: true },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // 4. Verify payment belongs to this user
    if (payment.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Payment does not belong to this user' },
        { status: 403 }
      );
    }

    // 5. Check if already completed
    if (payment.status === 'completed') {
      return NextResponse.json(
        { error: 'Payment already completed' },
        { status: 400 }
      );
    }

    // 6. Complete payment with Pi Network
    await piBackend.completePayment(paymentId, txid);

    // 7. Update payment in database
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'completed',
        transactionId: txid,
      },
    });

    // 8. Update booking status if exists
    if (payment.bookingId) {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          paymentStatus: 'paid',
          status: 'confirmed',
        },
      });
    }

    // 9. Update user Pi balance and create transaction
    await prisma.$transaction([
      // Add Pi cashback (2% of payment)
      prisma.user.update({
        where: { id: session.user.id },
        data: { piBalance: { increment: payment.amount * 0.02 } },
      }),
      // Create Pi transaction record
      prisma.piTransaction.create({
        data: {
          userId: session.user.id,
          type: 'cashback',
          amount: payment.amount * 0.02,
          description: `2% cashback on payment ${paymentId}`,
          balanceAfter: payment.user.piBalance + payment.amount * 0.02,
          piPaymentId: paymentId,
          status: 'completed',
        },
      }),
    ]);

    // 10. Send notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'payment',
        title: 'Payment Completed! 🎉',
        message: `Your payment of π${payment.amount} has been completed. You earned π${(payment.amount * 0.02).toFixed(2)} cashback!`,
        data: { paymentId, txid },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment completed successfully',
      paymentId,
      txid,
      cashback: payment.amount * 0.02,
    });
  } catch (error) {
    console.error('Payment completion error:', error);
    return NextResponse.json(
      { error: 'Payment completion failed' },
      { status: 500 }
    );
  }
}
