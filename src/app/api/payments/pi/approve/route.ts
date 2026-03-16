// src/app/api/payments/pi/approve/route.ts
// ✅ FIXED: Removed NextAuth session requirement
// Security via Pi Platform API key verification instead

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { approvePayment, getPayment } from '@/lib/pi-network/platform-api';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';

  console.log(`[${requestId}] 📥 Payment approval request received`);

  try {
    const body = await request.json();
    const { paymentId, piPaymentId } = body;

    if (!paymentId && !piPaymentId) {
      return NextResponse.json(
        { error: 'paymentId or piPaymentId is required', requestId },
        { status: 400 }
      );
    }

    // ✅ Find payment by our internal ID (most reliable) or by piPaymentId
    const payment = await prisma.payment.findFirst({
      where: paymentId
        ? { id: paymentId }
        : { piPaymentId },
      include: {
        booking: true,
        user: true,
      },
    });

    if (!payment) {
      console.error(`[${requestId}] ❌ Payment not found: paymentId=${paymentId}, piPaymentId=${piPaymentId}`);
      return NextResponse.json(
        { error: 'Payment not found', requestId },
        { status: 404 }
      );
    }

    // ✅ Link piPaymentId if not already linked
    const piPaymentIdToUse = piPaymentId || payment.piPaymentId;

    if (!piPaymentIdToUse) {
      return NextResponse.json(
        { error: 'Pi payment ID is required', requestId },
        { status: 400 }
      );
    }

    if (!payment.piPaymentId && piPaymentId) {
      console.log(`[${requestId}] 🔗 Linking piPaymentId to payment ${payment.id}`);
      await prisma.payment.update({
        where: { id: payment.id },
        data: { piPaymentId },
      });
    }

    // ✅ Idempotency: already approved
    if (payment.status === 'approved' || payment.status === 'completed') {
      console.log(`[${requestId}] ✅ Payment already approved (idempotent)`);
      return NextResponse.json({
        success: true,
        alreadyApproved: true,
        paymentId: payment.id,
        piPaymentId: piPaymentIdToUse,
        status: payment.status,
        requestId,
      });
    }

    // ✅ Verify with Pi Platform API (security via API key, not session)
    let piPaymentData;
    try {
      piPaymentData = await getPayment(piPaymentIdToUse);
    } catch (err) {
      console.error(`[${requestId}] ❌ Pi Platform fetch failed:`, err);
      return NextResponse.json(
        { error: 'Failed to verify payment with Pi Network', requestId },
        { status: 502 }
      );
    }

    // Security checks
    if (piPaymentData.direction !== 'user_to_app') {
      console.error(`[${requestId}] 🚨 Invalid direction: ${piPaymentData.direction}`);
      return NextResponse.json(
        { error: 'Invalid payment direction', requestId },
        { status: 400 }
      );
    }

    if (piPaymentData.status?.cancelled || piPaymentData.status?.user_cancelled) {
      return NextResponse.json(
        { error: 'Payment was cancelled', requestId },
        { status: 400 }
      );
    }

    // ✅ Approve on Pi Platform
    console.log(`[${requestId}] 📝 Approving on Pi Platform...`);
    try {
      await approvePayment(piPaymentIdToUse);
    } catch (err) {
      console.error(`[${requestId}] ❌ Pi Platform approval failed:`, err);
      return NextResponse.json(
        { error: 'Pi Network approval failed. Please try again.', requestId },
        { status: 502 }
      );
    }

    // ✅ Update database
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'approved',
        piPaymentId: piPaymentIdToUse,
        metadata: {
          ...(payment.metadata as object || {}),
          approvedAt: new Date().toISOString(),
          requestId,
          clientIp,
        },
      },
    });

    // Update booking status
    if (payment.bookingId) {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { paymentStatus: 'processing' },
      });
      console.log(`[${requestId}] 📅 Booking ${payment.bookingId} → processing`);
    }

    console.log(`[${requestId}] 🎉 Payment approved successfully`);

    return NextResponse.json({
      success: true,
      alreadyApproved: false,
      paymentId: updatedPayment.id,
      piPaymentId: piPaymentIdToUse,
      status: updatedPayment.status,
      bookingId: payment.bookingId,
      requestId,
    }, { status: 201 });

  } catch (error) {
    console.error(`[${requestId}] ❌ Unexpected error:`, error);
    return NextResponse.json(
      {
        error: 'Payment approval failed',
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
    service: 'Payment Approval',
    status: 'operational',
    version: '3.0.0',
    note: 'Secured via Pi Platform API Key (no session required)',
  });
}
