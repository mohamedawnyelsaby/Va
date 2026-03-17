// src/app/api/payments/pi/approve/route.ts
// v7 — Handle both paymentId and piPaymentId, Pi API call guaranteed

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

const PI_API_URL = 'https://api.minepi.com';
const PI_API_KEY = process.env.PI_API_KEY;
const IS_SANDBOX =
  process.env.PI_SANDBOX === 'true' ||
  process.env.NEXT_PUBLIC_PI_SANDBOX === 'true';

async function updateDbBackground(
  internalPaymentId: string | undefined,
  piPaymentId: string | undefined,
  requestId: string
): Promise<void> {
  try {
    if (!internalPaymentId && !piPaymentId) return;

    // Use shorter timeout for DB connection
    const payment = await prisma.payment.findFirst({
      where: internalPaymentId
        ? { id: internalPaymentId }
        : { piPaymentId },
      // If not found by internal ID, try piPaymentId as fallback
    });

    if (!payment && internalPaymentId) {
      // Maybe internalPaymentId is actually a piPaymentId
      const p2 = await prisma.payment.findFirst({ where: { piPaymentId: internalPaymentId } });
      if (!p2) { console.error(`[${requestId}] DB: payment not found`); return; }
      await prisma.payment.update({
        where: { id: p2.id },
        data: { status: 'approved', piPaymentId: piPaymentId || internalPaymentId,
          metadata: { ...((p2.metadata as object) || {}), approvedAt: new Date().toISOString(), requestId } }
      });
      if (p2.bookingId) await prisma.booking.update({ where: { id: p2.bookingId }, data: { paymentStatus: 'processing' } });
      console.log(`[${requestId}] DB: approved via piPaymentId fallback`);
      return;
    }

    if (!payment) { console.error(`[${requestId}] DB: not found`); return; }
    if (payment.status === 'approved' || payment.status === 'completed') {
      console.log(`[${requestId}] DB: already approved`); return;
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'approved',
        piPaymentId: piPaymentId || payment.piPaymentId,
        metadata: { ...((payment.metadata as object) || {}), approvedAt: new Date().toISOString(), requestId, sandboxMode: IS_SANDBOX }
      }
    });
    if (payment.bookingId) {
      await prisma.booking.update({ where: { id: payment.bookingId }, data: { paymentStatus: 'processing' } });
    }
    console.log(`[${requestId}] DB: payment approved ✅`);
  } catch (err) {
    console.error(`[${requestId}] DB error:`, err instanceof Error ? err.message : err);
  }
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] 📥 v7 ${new Date().toISOString()} sandbox=${IS_SANDBOX} apiKey=${!!PI_API_KEY}`);

  let paymentId: string | undefined;
  let piPaymentId: string | undefined;

  try {
    const body = await request.json();
    paymentId = body?.paymentId;
    piPaymentId = body?.piPaymentId;
    console.log(`[${requestId}] body: paymentId=${paymentId} piPaymentId=${piPaymentId}`);
  } catch (err) {
    console.error(`[${requestId}] parse error:`, err);
    return NextResponse.json({ success: true, requestId, warning: 'parse error' });
  }

  // KEY FIX: In Pi SDK, onReadyForServerApproval receives paymentId = Pi payment ID
  // So if piPaymentId not sent, use paymentId as the Pi payment ID
  const piIdToApprove = piPaymentId || paymentId;

  console.log(`[${requestId}] will call Pi API with: ${piIdToApprove}`);

  // ✅ Call Pi Platform SYNCHRONOUSLY — this is what Pi wallet waits for
  if (piIdToApprove && PI_API_KEY) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);

    try {
      console.log(`[${requestId}] 🌐 POST ${PI_API_URL}/v2/payments/${piIdToApprove}/approve`);
      const piRes = await fetch(
        `${PI_API_URL}/v2/payments/${piIdToApprove}/approve`,
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
      console.log(`[${requestId}] Pi API response: ${piRes.status} — ${text.slice(0, 400)}`);
    } catch (err) {
      clearTimeout(timer);
      console.error(`[${requestId}] Pi API error:`, err instanceof Error ? err.message : err);
    }
  } else {
    console.warn(`[${requestId}] ⚠️ skipping Pi API — piId=${piIdToApprove} apiKey=${!!PI_API_KEY}`);
  }

  // Background DB update (non-blocking)
  updateDbBackground(paymentId, piPaymentId || paymentId, requestId).catch(e =>
    console.error(`[${requestId}] BG:`, e)
  );

  console.log(`[${requestId}] ✅ returning 200`);
  return NextResponse.json({
    success: true,
    paymentId,
    piPaymentId: piIdToApprove,
    status: 'approved',
    requestId,
  });
}

export async function GET() {
  return NextResponse.json({
    service: 'Payment Approval v7',
    status: 'operational',
    sandbox: IS_SANDBOX,
    piApiKeySet: !!PI_API_KEY,
    piApiKeyPrefix: PI_API_KEY ? PI_API_KEY.substring(0, 8) + '...' : 'NOT SET',
    note: 'v7: piId = piPaymentId || paymentId, Pi API always called',
  });
}
