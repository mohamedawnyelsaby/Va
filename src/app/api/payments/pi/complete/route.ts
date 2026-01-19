// src/app/api/payments/pi/complete/route.ts
// Pi Network Payment Completion Endpoint
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db';

const PI_API_URL = process.env.NEXT_PUBLIC_PI_SANDBOX === 'true'
  ? 'https://api.minepi.com'
  : 'https://api.minepi.com';

/**
 * POST /api/payments/pi/complete
 * Complete Pi Network payment after blockchain confirmation
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { paymentId, piPaymentId, txid } = body;

    if (!paymentId || !piPaymentId || !txid) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get payment from database
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            piBalance: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (payment.status === 'completed') {
      return NextResponse.json(
        { error: 'Payment already completed' },
        { status: 400 }
      );
    }

    if (payment.status !== 'approved') {
      return NextResponse.json(
        { error: 'Payment must be approved first' },
        { status: 400 }
      );
    }

    try {
      // Complete payment on Pi Network
      const completeResponse = await fetch(
        `${PI_API_URL}/v2/payments/${piPaymentId}/complete`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Key ${process.env.PI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ txid }),
        }
      );

      if (!completeResponse.ok) {
        throw new Error('Failed to complete payment on Pi Network');
      }

      const piPaymentComplete = await completeResponse.json();

      // Update payment in database
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          piTxid: txid,
          status: 'completed',
          metadata: {
            ...(payment.metadata as object),
            completedAt: new Date().toISOString(),
            piCompletionData: piPaymentComplete,
          },
        },
      });

      // Update booking as confirmed
      if (payment.booking) {
        await prisma.booking.update({
          where: { id: payment.booking.id },
          data: {
            status: 'confirmed',
            paymentStatus: 'paid',
          },
        });
      }

      // Apply Pi cashback (2% of payment amount)
      const cashbackAmount = payment.amount * 0.02;
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          piBalance: {
            increment: cashbackAmount,
          },
        },
      });

      return NextResponse.json({
        success: true,
        paymentId: updatedPayment.id,
        status: 'completed',
        txid,
        cashback: cashbackAmount,
        message: 'Payment completed successfully! Cashback credited to your account.',
      });
    } catch (piError) {
      console.error('Pi Network completion error:', piError);
      
      // Update payment with error but don't fail completely
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          errorMessage: piError instanceof Error ? piError.message : 'Completion error',
        },
      });

      return NextResponse.json(
        { 
          error: 'Payment completion failed',
          details: piError instanceof Error ? piError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Payment completion error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to complete payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
