// src/app/api/payments/pi/complete/route.ts
// ✅ FIXED: Removed NextAuth session requirement

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { completePayment } from '@/lib/pi-network/platform-api';
import { sendBookingConfirmation, sendPaymentConfirmation } from '@/lib/email/notifications';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
  const CASHBACK_RATE = 0.02;

  console.log(`[${requestId}] 📥 Payment completion request received`);

  try {
    const body = await request.json();
    const { paymentId, piPaymentId, txid } = body;

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

    // ✅ Find payment
    const payment = await prisma.payment.findFirst({
      where: paymentId
        ? { id: paymentId }
        : { piPaymentId },
      include: {
        booking: {
          include: {
            hotel: true,
            attraction: true,
            restaurant: true,
          },
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

    const piPaymentIdToUse = piPaymentId || payment.piPaymentId;

    // ✅ Idempotency
    if (payment.status === 'completed') {
      if (payment.piTxid === txid) {
        console.log(`[${requestId}] ✅ Already completed (idempotent)`);
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
        { error: `Cannot complete payment in '${payment.status}' state. Must be approved first.`, requestId },
        { status: 409 }
      );
    }

    // ✅ Complete on Pi Platform
    if (piPaymentIdToUse) {
      try {
        await completePayment(piPaymentIdToUse, txid);
        console.log(`[${requestId}] ✅ Pi Platform completion successful`);
      } catch (err) {
        console.error(`[${requestId}] ❌ Pi Platform completion failed:`, err);
        return NextResponse.json(
          { error: 'Pi Network completion failed. Please try again.', requestId },
          { status: 502 }
        );
      }
    }

    const cashback = parseFloat((payment.amount * CASHBACK_RATE).toFixed(7));

    // ✅ Database transaction
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
          },
        },
      });

      // Confirm booking
      if (payment.booking) {
        await tx.booking.update({
          where: { id: payment.booking.id },
          data: {
            status: 'confirmed',
            paymentStatus: 'paid',
          },
        });
        console.log(`[${requestId}] ✅ Booking ${payment.booking.id} confirmed`);
      }

      // Credit cashback
      await tx.user.update({
        where: { id: payment.userId },
        data: { piBalance: { increment: cashback } },
      });

      return updated;
    });

    // Send emails (non-blocking)
    if (payment.user?.email && payment.booking) {
      const itemName =
        payment.booking.hotel?.name ||
        payment.booking.attraction?.name ||
        payment.booking.restaurant?.name ||
        payment.booking.itemName;

      sendBookingConfirmation(
        payment.user.email,
        payment.booking.id,
        itemName,
        payment.user.name || 'Valued Customer'
      ).catch((e) => console.warn(`[${requestId}] Email send failed:`, e));

      sendPaymentConfirmation(
        payment.user.email,
        payment.amount,
        payment.currency,
        payment.user.name || 'Valued Customer'
      ).catch((e) => console.warn(`[${requestId}] Email send failed:`, e));
    }

    console.log(`[${requestId}] 🎉 Payment completed! Cashback: ${cashback} Pi`);

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
    console.error(`[${requestId}] ❌ Completion error:`, error);
    return NextResponse.json(
      {
        error: 'Payment completion failed',
        requestId,
        details: process.env.NODE_ENV === 'development'
          ? error instanceof Error ? error.message : 'Unknown error'
          : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Payment Completion',
    status: 'operational',
    version: '3.0.0',
    note: 'Secured via Pi Platform API Key (no session required)',
  });
}
