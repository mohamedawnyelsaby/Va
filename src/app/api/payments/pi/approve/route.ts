// src/app/api/payments/pi/approve/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

const PI_API_URL = 'https://api.minepi.com';
const PI_API_KEY = process.env.PI_API_KEY;
const IS_SANDBOX =
  process.env.PI_SANDBOX === 'true' ||
  process.env.NEXT_PUBLIC_PI_SANDBOX === 'true';

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';

  console.log(`[${requestId}] 📥 Payment approval request received`);
  console.log(`[${requestId}] 🌍 Sandbox: ${IS_SANDBOX}`);
  console.log(`[${requestId}] 🔑 PI_API_KEY set: ${!!PI_API_KEY}`);

  try {
    const body = await request.json();
    const { paymentId, piPaymentId } = body;

    console.log(`[${requestId}] paymentId=${paymentId}, piPaymentId=${piPaymentId}`);

    if (!paymentId && !piPaymentId) {
      return NextResponse.json(
        { error: 'paymentId or piPaymentId is required', requestId },
        { status: 400 }
      );
    }

    // Find payment in DB
    const payment = await prisma.payment.findFirst({
      where: paymentId ? { id: paymentId } : { piPaymentId },
      include: { booking: true, user: true },
    });

    if (!payment) {
      console.error(`[${requestId}] ❌ Payment not found`);
      return NextResponse.json(
        { error: 'Payment not found', requestId },
        { status: 404 }
      );
    }

    console.log(`[${requestId}] ✅ Payment found: ${payment.id}, status: ${payment.status}`);

    const piPaymentIdToUse = piPaymentId || payment.piPaymentId;

    // Idempotency
    if (payment.status === 'approved' || payment.status === 'completed') {
      console.log(`[${requestId}] ✅ Already approved (idempotent)`);
      return NextResponse.json({
        success: true,
        alreadyApproved: true,
        paymentId: payment.id,
        piPaymentId: piPaymentIdToUse,
        status: payment.status,
        requestId,
      });
    }

    // Link piPaymentId if not set
    if (!payment.piPaymentId && piPaymentId) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { piPaymentId },
      });
      console.log(`[${requestId}] 🔗 Linked piPaymentId: ${piPaymentId}`);
    }

    // Call Pi Platform API
    let piApprovalSuccess = false;
    let piApprovalError = '';

    if (piPaymentIdToUse && PI_API_KEY) {
      try {
        console.log(`[${requestId}] 🌐 Calling Pi Platform approve...`);

        const piRes = await fetch(
          `${PI_API_URL}/v2/payments/${piPaymentIdToUse}/approve`,
          {
            method: 'POST',
            headers: {
              Authorization: `Key ${PI_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const piResText = await piRes.text();
        console.log(`[${requestId}] Pi Platform: ${piRes.status} - ${piResText}`);

        if (piRes.ok) {
          piApprovalSuccess = true;
        } else {
          piApprovalError = `Pi API ${piRes.status}: ${piResText}`;
          // In sandbox, 400/409 are acceptable
          if (IS_SANDBOX && (piRes.status === 400 || piRes.status === 409)) {
            console.log(`[${requestId}] 🧪 Sandbox: accepting ${piRes.status}`);
            piApprovalSuccess = true;
          }
        }
      } catch (err) {
        piApprovalError = err instanceof Error ? err.message : 'Network error';
        console.error(`[${requestId}] ❌ Pi Platform error: ${piApprovalError}`);
        if (IS_SANDBOX) {
          console.log(`[${requestId}] 🧪 Sandbox: proceeding despite error`);
          piApprovalSuccess = true;
        }
      }
    } else if (!PI_API_KEY) {
      console.warn(`[${requestId}] ⚠️ PI_API_KEY not set`);
      if (IS_SANDBOX) {
        piApprovalSuccess = true;
      } else {
        return NextResponse.json(
          { error: 'Payment gateway not configured', requestId },
          { status: 503 }
        );
      }
    } else {
      // No piPaymentId
      if (IS_SANDBOX) piApprovalSuccess = true;
    }

    if (!piApprovalSuccess) {
      return NextResponse.json(
        {
          error: 'Pi Network approval failed. Please try again.',
          details: piApprovalError,
          requestId,
        },
        { status: 502 }
      );
    }

    // Update DB
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'approved',
        piPaymentId: piPaymentIdToUse || payment.piPaymentId,
        metadata: {
          ...(payment.metadata as object || {}),
          approvedAt: new Date().toISOString(),
          requestId,
          clientIp,
          sandboxMode: IS_SANDBOX,
        },
      },
    });

    if (payment.bookingId) {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { paymentStatus: 'processing' },
      });
    }

    console.log(`[${requestId}] 🎉 Approved: ${updatedPayment.id}`);

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
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Payment Approval v4',
    status: 'operational',
    sandbox: IS_SANDBOX,
    piApiKeySet: !!PI_API_KEY,
    piApiKeyPrefix: PI_API_KEY ? PI_API_KEY.substring(0, 8) + '...' : 'NOT SET',
  });
}
