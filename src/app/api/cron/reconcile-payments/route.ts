// src/app/api/cron/reconcile-payments/route.ts
//
// Safety net for Pi payments. Pi does not push signed webhooks we can rely on,
// so if a user pays and then closes the app, nothing on the server ever learns
// the payment finished: the booking stays pending and the Pi payment stays
// open (blocking the user's next payment). The /recover endpoint only runs
// when that user comes back. This job sweeps stale 'pending'/'approved'
// payments and drives each through the SAME verification + finalize logic.
//
// Auth: Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. The route is
// closed (503) when CRON_SECRET is not set, so it can never be triggered
// anonymously.

import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { captureException } from '@/lib/monitoring/sentry';
import { getPayment } from '@/lib/pi-network/platform-api';
import { reconcilePiPayment } from '@/lib/payments/reconcile';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Give the normal flow time to finish before we step in.
const MIN_AGE_MS = 10 * 60 * 1000;
// Don't chase very old payments forever.
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const BATCH_SIZE = 25;

function isAuthorized(request: NextRequest, secret: string): boolean {
  const provided = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret}`);
  return provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 });
  }
  if (!isAuthorized(request, secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = Date.now();
  const stale = await prisma.payment.findMany({
    where: {
      status: { in: ['pending', 'approved'] },
      piPaymentId: { not: null },
      createdAt: { lt: new Date(now - MIN_AGE_MS), gt: new Date(now - MAX_AGE_MS) },
    },
    orderBy: { createdAt: 'asc' },
    take: BATCH_SIZE,
    select: { id: true, bookingId: true, status: true, amount: true, piPaymentId: true },
  });

  const summary: Record<string, number> = {};
  const bump = (key: string) => {
    summary[key] = (summary[key] ?? 0) + 1;
  };

  // Sequential on purpose: gentle on Pi's API and on our DB.
  for (const payment of stale) {
    const piPaymentId = payment.piPaymentId;
    if (!piPaymentId) {continue;}
    try {
      const piPayment = await getPayment(piPaymentId);
      const result = await reconcilePiPayment({
        payment,
        piPayment,
        piPaymentId,
        requestId: `cron-${piPaymentId}`,
        source: 'reconcile',
      });
      bump(result.resolved);
    } catch (err) {
      bump('error');
      logger.error('[cron/reconcile] failed for payment', payment.id, err instanceof Error ? err.message : err);
      captureException(err instanceof Error ? err : new Error(String(err)), {
        context: 'cron/reconcile-payments',
        paymentId: payment.id,
      });
    }
  }

  logger.log(`[cron/reconcile] checked ${stale.length} payment(s):`, JSON.stringify(summary));
  return NextResponse.json({ checked: stale.length, summary });
}
