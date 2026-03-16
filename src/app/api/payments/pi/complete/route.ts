// src/app/api/payments/pi/complete/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

const PI_API_URL = 'https://api.minepi.com';
const PI_API_KEY = process.env.PI_API_KEY;
const IS_SANDBOX =
  process.env.PI_SANDBOX === 'true' ||
  process.env.NEXT_PUBLIC_PI_SANDBOX === 'true';
const CASHBACK_RATE = 0.02;

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';

  console.log(`[${requestId}] 📥 Payment completion request received`);

  try {
    const body = await request.json();
    const { paymentId, piPaymentId, txid } = body;

    console.log(`[${requestId}] paymentId=${paymentId}, piPaymentId=${piPaymentId}, txid=${txid}`);

    if (!txid) {
      return NextResponse.json(
        { error: 'Transaction ID (txid) is required', requestId },
        { status: 400 }
      );
    }

    if (!paymentId && !piPaymentId) {
      return NextResponse.json(
        { error: 'paymentId or piPaymentId is required', requestId },
        { status: 400 }
      );
    }

    // Find payment
    const payment = await prisma.payment.findFirst({
      where: paymentId ? { id: paymentId } : { piPaymentId },
      include: {
        booking: {
          include: { hotel: true, attraction: true, restaurant: true },
        },
        user: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found', requestId },
        { status: 404 }
      );
    }

    console.log(`[${requestId}] ✅ Payment found: ${payment.id}, status: ${payment.status}`);

    const piPaymentIdToUse = piPaymentId || payment.piPaymentId;

    // Idempotency
    if (payment.status === 'completed') {
      if (!payment.piTxid || payment.piTxid === txid) {
        return NextResponse.json({
          success: true,
          alreadyCompleted: true,
          paymentId: payment.id,
          txid,
          cashback: payment.amount * CASHBACK_RATE,
          requestId,
        });
      }
      return NextResponse.json(
        { error: 'Payment completed with different txid', requestId },
        { status: 409 }
      );
    }

    // Must be approved first
    if (payment.status !== 'approved') {
      return NextResponse.json(
        {
          error: `Cannot complete payment in '${payment.status}' state. Must be approved first.`,
          requestId,
        },
        { status: 409 }
      );
    }

    // Call Pi Platform
    let piCompleteSuccess = false;
    let piCompleteError = '';

    if (piPaymentIdToUse && PI_API_KEY) {
      try {
        console.log(`[${requestId}] 🌐 Calling Pi Platform complete...`);

        const piRes = await fetch(
          `${PI_API_URL}/v2/payments/${piPaymentIdToUse}/complete`,
          {
            method: 'POST',
            headers: {
              Authorization: `Key ${PI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ txid }),
          }
        );

        const piResText = await piRes.text();
        console.log(`[${requestId}] Pi Platform: ${piRes.status} - ${piResText}`);

        if (piRes.ok) {
          piCompleteSuccess = true;
        } else {
          piCompleteError = `Pi API ${piRes.status}: ${piResText}`;
          if (IS_SANDBOX && (piRes.status === 400 || piRes.status === 409)) {
            piCompleteSuccess = true;
          }
        }
      } catch (err) {
        piCompleteError = err instanceof Error ? err.message : 'Network error';
        console.error(`[${requestId}] ❌ Pi Platform error: ${piCompleteError}`);
        if (IS_SANDBOX) piCompleteSuccess = true;
      }
    } else {
      if (IS_SANDBOX) {
        piCompleteSuccess = true;
      } else {
        return NextResponse.json(
          { error: 'Payment gateway not configured', requestId },
          { status: 503 }
        );
      }
    }

    if (!piCompleteSuccess) {
      return NextResponse.json(
        {
          error: 'Pi Network completion failed. Please try again.',
          details: piCompleteError,
          requestId,
        },
        { status: 502 }
      );
    }

    const cashback = parseFloat((payment.amount * CASHBACK_RATE).toFixed(7));

    // Database transaction
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id: payment.id },
        data: {
          piTxid: txid,
          piPaymentId: piPaymentIdToUse || payment.piPaymentId,
          status: 'completed',
          metadata: {
            ...(payment.metadata as object || {}),
            completedAt: new Date().toISOString(),
            txid,
            cashback,
            requestId,
            sandboxMode: IS_SANDBOX,
          },
        },
      });

      if (payment.booking) {
        await tx.booking.update({
          where: { id: payment.booking.id },
          data: { status: 'confirmed', paymentStatus: 'paid' },
        });
        console.log(`[${requestId}] ✅ Booking confirmed`);
      }

      await tx.user.update({
        where: { id: payment.userId },
        data: { piBalance: { increment: cashback } },
      });

      console.log(`[${requestId}] 💰 Cashback ${cashback} Pi credited`);
      return updated;
    });

    console.log(`[${requestId}] 🎉 Payment completed!`);

    return NextResponse.json({
      success: true,
      alreadyCompleted: false,
      paymentId: result.id,
      piPaymentId: piPaymentIdToUse,
      txid,
      status: result.status,
      bookingId: payment.bookingId,
      amount: payment.amount,
      cashback,
      message: `Payment completed! You earned ${cashback} Pi cashback.`,
      requestId,
    }, { status: 201 });

  } catch (error) {
    console.error(`[${requestId}] ❌ Unexpected error:`, error);
    return NextResponse.json(
      {
        error: 'Payment completion failed',
        requestId,
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Payment Completion v4',
    status: 'operational',
    sandbox: IS_SANDBOX,
    piApiKeySet: !!PI_API_KEY,
  });
}
