// src/app/api/pi/refund/route.ts
// ✅ Refund Payment (A2U)

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { piBackend } from '@/lib/pi-network/backend';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const refundSchema = z.object({
  paymentId: z.string(),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { paymentId, reason } = refundSchema.parse(body);

    // Get original payment
    const payment = await prisma.payment.findUnique({
      where: { piPaymentId: paymentId },
      include: { user: true },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.status !== 'completed') {
      return NextResponse.json(
        { error: 'Only completed payments can be refunded' },
        { status: 400 }
      );
    }

    // Check if already refunded
    const existingRefund = await prisma.payment.findFirst({
      where: {
        metadata: {
          path: ['refundOf'],
          equals: paymentId,
        },
      },
    });

    if (existingRefund) {
      return NextResponse.json(
        { error: 'Payment already refunded' },
        { status: 400 }
      );
    }

    // Create A2U payment (refund)
    const refund = await piBackend.createA2UPayment(
      payment.user.piUsername!,
      payment.amount,
      `Refund for payment ${paymentId}${reason ? ': ' + reason : ''}`,
      { refundOf: paymentId }
    );

    // Store refund in database
    await prisma.$transaction([
      // Create refund payment record
      prisma.payment.create({
        data: {
          userId: payment.userId,
          amount: payment.amount,
          currency: 'PI',
          piAmount: payment.amount,
          paymentMethod: 'pi_network',
          piPaymentId: refund.paymentId,
          transactionId: refund.txid,
          status: 'completed',
          metadata: {
            refundOf: paymentId,
            reason,
          },
        },
      }),
      // Update original payment status
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'refunded' },
      }),
      // Update booking if exists
      payment.bookingId
        ? prisma.booking.update({
            where: { id: payment.bookingId },
            data: { status: 'cancelled', paymentStatus: 'refunded' },
          })
        : prisma.$queryRaw`SELECT 1`, // No-op if no booking
    ]);

    // Send notification
    await prisma.notification.create({
      data: {
        userId: payment.userId,
        type: 'payment',
        title: 'Refund Processed',
        message: `Your refund of π${payment.amount} has been processed.`,
        data: { paymentId: refund.paymentId, txid: refund.txid },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Refund processed successfully',
      refundPaymentId: refund.paymentId,
      txid: refund.txid,
      amount: payment.amount,
    });
  } catch (error) {
    console.error('Refund error:', error);
    return NextResponse.json(
      { error: 'Refund failed' },
      { status: 500 }
    );
  }
}
