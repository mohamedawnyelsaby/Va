// src/app/api/payments/pi/approve/route.ts
// SECURITY FIX (2026-07-13):
// 1) No session/ownership check existed — anyone who knew a paymentId or
//    piPaymentId could trigger an "approve" call against Pi's API and flip
//    the payment/booking into 'approved'/'processing' state for a payment
//    that wasn't theirs. Now requires a session whose userId matches the
//    payment's owner before calling Pi at all.
// 2) The GET diagnostic endpoint returned the first 8 characters of the
//    real PI_API_KEY to any visitor (`piApiKeyPrefix`). Removed entirely —
//    a health check never needs to expose part of a real secret.

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
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

    const payment = await prisma.payment.findFirst({
      where: internalPaymentId
        ? { id: internalPaymentId }
        : { piPaymentId },
    });

    if (!payment && internalPaymentId) {
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
  console.log(`[${requestId}] 📥 v8 ${new Date().toISOString()} sandbox=${IS_SANDBOX} apiKey=${!!PI_API_KEY}`);

  // ✅ FIX: require a real, verified session before doing anything.
  const session = await getServerSession(authOptions);
  const sessionUserId = session?.user?.id;
  if (!sessionUserId) {
    return NextResponse.json({ error: 'Unauthorized', requestId }, { status: 401 });
  }

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

  if (!paymentId && !piPaymentId) {
    return NextResponse.json({ error: 'paymentId or piPaymentId is required', requestId }, { status: 400 });
  }

  // ✅ FIX: ownership check — look the payment up and confirm it belongs
  // to the current session before ever calling Pi's API.
  const existingPayment = await prisma.payment.findFirst({
    where: paymentId ? { id: paymentId } : { piPaymentId },
  });

  if (!existingPayment) {
    return NextResponse.json({ error: 'Payment not found', requestId }, { status: 404 });
  }

  if (existingPayment.userId !== sessionUserId) {
    return NextResponse.json({ error: 'Forbidden', requestId }, { status: 403 });
  }

  // KEY: In Pi SDK, onReadyForServerApproval receives paymentId = Pi payment ID
  // So if piPaymentId not sent, use paymentId as the Pi payment ID
  const piIdToApprove = piPaymentId || paymentId;

  console.log(`[${requestId}] will call Pi API with: ${piIdToApprove}`);

  // Call Pi Platform SYNCHRONOUSLY — this is what Pi wallet waits for
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
    service: 'Payment Approval v8',
    status: 'operational',
    sandbox: IS_SANDBOX,
    piApiKeySet: !!PI_API_KEY,
    // ✅ FIX: no longer exposes any part of the real API key.
    note: 'v8: ownership-checked, piId = piPaymentId || paymentId',
  });
}
