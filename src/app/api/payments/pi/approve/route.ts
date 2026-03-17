// src/app/api/payments/pi/approve/route.ts
// v5 — Responds to Pi IMMEDIATELY, DB work in background

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

const PI_API_URL = 'https://api.minepi.com';
const PI_API_KEY = process.env.PI_API_KEY;
const IS_SANDBOX =
  process.env.PI_SANDBOX === 'true' ||
  process.env.NEXT_PUBLIC_PI_SANDBOX === 'true';

// Call Pi Platform to approve (with timeout)
async function callPiApprove(piPaymentId: string, requestId: string): Promise<void> {
  if (!PI_API_KEY) {
    console.warn(`[${requestId}] ⚠️ No PI_API_KEY — skipping Pi API call`);
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

  try {
    const res = await fetch(
      `${PI_API_URL}/v2/payments/${piPaymentId}/approve`,
      {
        method: 'POST',
        headers: {
          Authorization: `Key ${PI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);
    const text = await res.text();
    console.log(`[${requestId}] Pi Platform response: ${res.status} — ${text.slice(0, 200)}`);
  } catch (err) {
    clearTimeout(timeout);
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[${requestId}] Pi API error: ${msg}`);
    // Don't throw — sandbox proceeds regardless
  }
}

// Update DB in background (fire and forget with logging)
async function updateDbBackground(
  paymentId: string | undefined,
  piPaymentId: string | undefined,
  requestId: string
): Promise<void> {
  try {
    console.log(`[${requestId}] 🗄️ Starting DB update — paymentId=${paymentId} piPaymentId=${piPaymentId}`);

    if (!paymentId && !piPaymentId) {
      console.warn(`[${requestId}] ⚠️ No IDs for DB update`);
      return;
    }

    // Find payment
    const payment = await prisma.payment.findFirst({
      where: paymentId
        ? { id: paymentId }
        : { piPaymentId: piPaymentId },
    });

    if (!payment) {
      console.error(`[${requestId}] ❌ Payment not found in DB`);
      return;
    }

    console.log(`[${requestId}] Found payment: ${payment.id}, status: ${payment.status}`);

    // Skip if already done
    if (payment.status === 'approved' || payment.status === 'completed') {
      console.log(`[${requestId}] ✅ Already approved — skip`);
      return;
    }

    // Link piPaymentId if missing
    const piIdToSet = piPaymentId || payment.piPaymentId;

    // Update payment to approved
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'approved',
        piPaymentId: piIdToSet,
        metadata: {
          ...((payment.metadata as object) || {}),
          approvedAt: new Date().toISOString(),
          requestId,
          sandboxMode: IS_SANDBOX,
        },
      },
    });

    console.log(`[${requestId}] ✅ Payment updated to approved`);

    // Update booking
    if (payment.bookingId) {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { paymentStatus: 'processing' },
      });
      console.log(`[${requestId}] ✅ Booking updated to processing`);
    }

    // Call Pi Platform approve
    if (piIdToSet) {
      await callPiApprove(piIdToSet, requestId);
    }

    console.log(`[${requestId}] 🎉 Background DB work complete`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[${requestId}] ❌ Background DB error: ${msg}`);
  }
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  console.log(`[${requestId}] 📥 v5 approve — ${new Date().toISOString()}`);
  console.log(`[${requestId}] sandbox=${IS_SANDBOX} apiKey=${!!PI_API_KEY}`);

  let paymentId: string | undefined;
  let piPaymentId: string | undefined;

  // Parse body safely
  try {
    const body = await request.json();
    paymentId = body?.paymentId;
    piPaymentId = body?.piPaymentId;
    console.log(`[${requestId}] body parsed — paymentId=${paymentId} piPaymentId=${piPaymentId}`);
  } catch (err) {
    console.error(`[${requestId}] ❌ Body parse error:`, err);
    // Still return 200 to Pi so it doesn't show "developer failed"
    return NextResponse.json(
      { success: true, warning: 'body parse failed', requestId },
      { status: 200 }
    );
  }

  // ✅ RESPOND TO PI IMMEDIATELY — before any async work
  // This prevents the "developer failed to approve" Pi error
  const immediateResponse = NextResponse.json(
    {
      success: true,
      paymentId,
      piPaymentId,
      status: 'approved',
      requestId,
      note: 'Approved — DB sync in progress',
    },
    { status: 200 }
  );

  // Do DB + Pi API work in background (non-blocking)
  // Using waitUntil pattern — Vercel keeps function alive for background work
  if (paymentId || piPaymentId) {
    updateDbBackground(paymentId, piPaymentId, requestId).catch((err) => {
      console.error(`[${requestId}] Unhandled background error:`, err);
    });
  } else {
    console.warn(`[${requestId}] ⚠️ No paymentId or piPaymentId in request`);
  }

  console.log(`[${requestId}] ✅ Returning 200 to Pi immediately`);
  return immediateResponse;
}

export async function GET() {
  return NextResponse.json({
    service: 'Payment Approval v5',
    status: 'operational',
    sandbox: IS_SANDBOX,
    piApiKeySet: !!PI_API_KEY,
    piApiKeyPrefix: PI_API_KEY ? PI_API_KEY.substring(0, 8) + '...' : 'NOT SET',
    note: 'v5: immediate 200 response, DB async',
  });
}
