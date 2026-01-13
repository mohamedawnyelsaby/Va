import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db';
import { PiBackend } from '@/lib/pi-network/backend';
import { z } from 'zod';

const PaymentSchema = z.object({
  paymentId: z.string(),
  bookingId: z.string(),
  amount: z.number().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { paymentId, bookingId, amount } = PaymentSchema.parse(body);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        hotel: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const piPayment = await PiBackend.getPayment(paymentId);

    if (!piPayment) {
      return NextResponse.json(
        { error: 'Pi payment not found' },
        { status: 404 }
      );
    }

    if (piPayment.amount !== amount) {
      return NextResponse.json(
        { error: 'Amount mismatch' },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        userId: session.user.id,
        amount,
        currency: 'PI',
        status: 'pending',
        // method: 'pi_network',
        piPaymentId: paymentId,
        metadata: {
          piUser: piPayment.user_uid,
          memo: piPayment.memo,
        },
      },
    });

    await PiBackend.approvePayment(paymentId);

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'processing' },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PAYMENT_CREATED',
        entityType: 'Payment',
        entityId: payment.id,
        changes: {
          amount,
          currency: 'PI',
          // method: 'pi_network',
        },
      },
    });

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
      },
    });
  } catch (error) {
    console.error('Pi payment error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
