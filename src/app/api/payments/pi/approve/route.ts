// src/app/api/payments/pi/approve/route.ts
// v6 — Call Pi API FIRST (sync), respond 200, DB in background

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

const PI_API_URL = 'https://api.minepi.com';
const PI_API_KEY = process.env.PI_API_KEY;
const IS_SANDBOX =
  process.env.PI_SANDBOX === 'true' ||
  process.env.NEXT_PUBLIC_PI_SANDBOX === 'true';

async function updateDbBackground(
  paymentId: string | undefined,
  piPaymentId: string | undefined,
  requestId: string
): Promise<void> {
  try {
    if (!paymentId && !piPaymentId) return;

    const payment = await prisma.payment.findFirst({
      where: paymentId ? { id: paymentId } : { piPaymentId },
    });

    if (!payment) {
      console.error(`[${requestId}] ❌ DB: Payment not found`);
      return;
    }

    if (payment.status === 'approved' || payment.status === 'completed') {
      console.log(`[${requestId}] ✅ DB: Already approved`);
      return;
    }

    const piIdToSet = piPaymentId || payment.piPaymentId;

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

    if (payment.bookingId) {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { paymentStatus: 'processing' },
      });
    }

    console.log(`[${requestId}] ✅ DB: Payment approved, booking updated`);
  } catch (err) {
    console.error(`[${requestId}] ❌ DB background error:`, err instanceof Error ? err.message : err);
  }
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] 📥 v6 approve ${new Date().toISOString()} sandbox=${IS_SANDBOX}`);

  let paymentId: string | undefined;
  let piPaymentId: string | undefined;

  // 1. Parse body
  try {
    const body = await request.json();
    paymentId = body?.paymentId;
    piPaymentId = body?.piPaymentId;
    console.log(`[${requestId}] paymentId=${paymentId} piPaymentId=${piPaymentId}`);
  } catch (err) {
    console.error(`[${requestId}] Body parse error:`, err);
    // Return 200 even on parse error — Pi must not see failure
    return NextResponse.json({ success: true, requestId, warning: 'parse error' });
  }

  // 2. Call Pi Platform API SYNCHRONOUSLY (before responding)
  //    Pi SDK waits for this before showing confirm screen
  if (piPaymentId && PI_API_KEY) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);

    try {
      console.log(`[${requestId}] 🌐 Calling Pi API approve for ${piPaymentId}...`);

      const piRes = await fetch(
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
      clearTimeout(timer);

      const text = await piRes.text();
      console.log(`[${requestId}] Pi API: ${piRes.status} — ${text.slice(0, 300)}`);

      if (!piRes.ok && !IS_SANDBOX) {
        // In production, if Pi rejects — still return 200 but log it
        console.warn(`[${requestId}] ⚠️ Pi API rejected but returning 200 anyway`);
      }
    } catch (err) {
      clearTimeout(timer);
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[${requestId}] Pi API error: ${msg}`);
      // Don't fail — Pi timeout shouldn't block our response
    }
  } else if (!PI_API_KEY) {
    console.warn(`[${requestId}] ⚠️ No PI_API_KEY`);
  } else {
    console.warn(`[${requestId}] ⚠️ No piPaymentId — can't call Pi API`);
  }

  // 3. Do DB work in background (non-blocking)
  if (paymentId || piPaymentId) {
    updateDbBackground(paymentId, piPaymentId, requestId).catch((e) =>
      console.error(`[${requestId}] BG error:`, e)
    );
  }

  // 4. Respond 200 immediately after Pi API call
  console.log(`[${requestId}] ✅ Returning 200`);
  return NextResponse.json({
    success: true,
    paymentId,
    piPaymentId,
    status: 'approved',
    requestId,
  });
}

export async function GET() {
  return NextResponse.json({
    service: 'Payment Approval v6',
    status: 'operational',
    sandbox: IS_SANDBOX,
    piApiKeySet: !!PI_API_KEY,
    piApiKeyPrefix: PI_API_KEY ? PI_API_KEY.substring(0, 8) + '...' : 'NOT SET',
    note: 'v6: Pi API sync first, then 200, DB async',
  });
}
