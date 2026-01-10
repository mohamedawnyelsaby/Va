// src/app/api/pi/approve/route.ts
// ✅ Server-Side Approval Endpoint

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { piBackend } from '@/lib/pi-network/backend';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const approveSchema = z.object({
  paymentId: z.string(),
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
    const { paymentId } = approveSchema.parse(body);

    // 3. Get payment from Pi Network
    const payment = await piBackend.getPayment(paymentId);

    // 4. Verify payment belongs to this user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { piUsername: true },
    });

    if (payment.user_uid !== user?.piUsername) {
      return NextResponse.json(
        { error: 'Payment does not belong to this user' },
        { status: 403 }
      );
    }

    // 5. Check if payment already exists in database
    const existingPayment = await prisma.payment.findUnique({
      where: { piPaymentId: paymentId },
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Payment already processed' },
        { status: 400 }
      );
    }

    // 6. Approve payment with Pi Network
    await piBackend.approvePayment(paymentId);

    // 7. Store in database
    await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: payment.amount,
        currency: 'PI',
        piAmount: payment.amount,
        paymentMethod: 'pi_network',
        piPaymentId: paymentId,
        status: 'pending',
        metadata: {
          memo: payment.memo,
          ...payment.metadata,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment approved',
      paymentId,
    });
  } catch (error) {
    console.error('Payment approval error:', error);
    return NextResponse.json(
      { error: 'Payment approval failed' },
      { status: 500 }
    );
  }
}

// ================================================================

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

// ================================================================

// src/app/api/pi/verify/route.ts
// ✅ Verify Payment Status

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { piBackend } from '@/lib/pi-network/backend';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID required' },
        { status: 400 }
      );
    }

    // Get payment from Pi Network
    const piPayment = await piBackend.getPayment(paymentId);

    // Get payment from database
    const dbPayment = await prisma.payment.findUnique({
      where: { piPaymentId: paymentId },
    });

    return NextResponse.json({
      piNetwork: piPayment,
      database: dbPayment,
      synced: piPayment.status.developer_completed === (dbPayment?.status === 'completed'),
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}

// ================================================================

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
