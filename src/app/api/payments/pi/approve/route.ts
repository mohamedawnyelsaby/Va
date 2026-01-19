// src/app/api/payments/pi/approve/route.ts
// Pi Network Payment Approval Endpoint
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db';

const PI_API_URL = process.env.NEXT_PUBLIC_PI_SANDBOX === 'true'
  ? 'https://api.minepi.com'
  : 'https://api.minepi.com';

/**
 * POST /api/payments/pi/approve
 * Approve Pi Network payment after user authorization
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
    const { paymentId, piPaymentId } = body;

    if (!paymentId || !piPaymentId) {
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

    if (payment.status !== 'pending') {
      return NextResponse.json(
        { error: `Payment already ${payment.status}` },
        { status: 400 }
      );
    }

    // Verify payment with Pi Network API
    try {
      const verifyResponse = await fetch(
        `${PI_API_URL}/v2/payments/${piPaymentId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Key ${process.env.PI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!verifyResponse.ok) {
        throw new Error('Failed to verify payment with Pi Network');
      }

      const piPayment = await verifyResponse.json();

      // Validate payment amount
      if (piPayment.amount !== payment.amount) {
        throw new Error('Payment amount mismatch');
      }

      // Approve payment on Pi Network
      const approveResponse = await fetch(
        `${PI_API_URL}/v2/payments/${piPaymentId}/approve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Key ${process.env.PI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!approveResponse.ok) {
        throw new Error('Failed to approve payment on Pi Network');
      }

      // Update payment in database
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          piPaymentId,
          status: 'approved',
          metadata: {
            ...(payment.metadata as object),
            approvedAt: new Date().toISOString(),
            piPaymentData: piPayment,
          },
        },
      });

      // Update booking status
      if (payment.booking) {
        await prisma.booking.update({
          where: { id: payment.booking.id },
          data: {
            paymentStatus: 'processing',
          },
        });
      }

      return NextResponse.json({
        success: true,
        paymentId: updatedPayment.id,
        status: 'approved',
        message: 'Payment approved successfully',
      });
    } catch (piError) {
      console.error('Pi Network API error:', piError);
      
      // Update payment as failed
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'failed',
          errorMessage: piError instanceof Error ? piError.message : 'Pi Network API error',
        },
      });

      return NextResponse.json(
        { 
          error: 'Payment approval failed',
          details: piError instanceof Error ? piError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Payment approval error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to approve payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
