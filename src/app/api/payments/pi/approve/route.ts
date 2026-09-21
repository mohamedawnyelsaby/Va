// src/app/api/payments/pi/approve/route.ts
//
// Server-side approval of a Pi payment (Pi SDK: onReadyForServerApproval).
//
// SECURITY FIXES (on top of the earlier session + ownership checks)
// - The Pi payment is fetched from Pi's own API and must MATCH our internal
//   payment: same amount, not cancelled, and its metadata must reference this
//   internal payment id. Before, any piPaymentId sent by the client was
//   approved and attached, whatever it was worth.
// - A piPaymentId can be bound to ONE internal payment only.
// - A failed call to Pi is now reported (502) instead of returning
//   `success: true`, and the DB is only moved to 'approved' after Pi accepted.
// - The GET diagnostic handler (which exposed configuration state) is gone.

import type { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getPayment, approvePayment } from '@/lib/pi-network/platform-api';

const AMOUNT_TOLERANCE = 1e-6;

const bodySchema = z.object({
  paymentId: z.string().min(1).max(64),
  piPaymentId: z.string().min(10).max(200),
});

export async function POST(request: NextRequest) {
  const limited = await checkRateLimit(request, 'payment');
  if (limited) {return limited;}

  const requestId = crypto.randomUUID();

  const guard = await requireUser();
  if ('response' in guard) {return guard.response;}
  const { userId } = guard;

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request', requestId }, { status: 400 });
  }
  const { paymentId, piPaymentId } = body;

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: { select: { status: true, paymentStatus: true } } },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found', requestId }, { status: 404 });
    }
    if (payment.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden', requestId }, { status: 403 });
    }

    // Idempotent retry of an already-approved payment.
    if (payment.status === 'approved' && payment.piPaymentId === piPaymentId) {
      return NextResponse.json({ success: true, paymentId, piPaymentId, status: 'approved', requestId });
    }
    if (payment.status !== 'pending') {
      return NextResponse.json(
        { error: `Cannot approve a payment in '${payment.status}' state`, requestId },
        { status: 409 }
      );
    }
    if (payment.booking && payment.booking.status === 'cancelled') {
      return NextResponse.json({ error: 'Booking was cancelled', requestId }, { status: 409 });
    }
    if (payment.piPaymentId && payment.piPaymentId !== piPaymentId) {
      return NextResponse.json({ error: 'Payment already linked to another Pi payment', requestId }, { status: 409 });
    }

    const conflict = await prisma.payment.findFirst({
      where: { piPaymentId, id: { not: payment.id } },
      select: { id: true },
    });
    if (conflict) {
      return NextResponse.json({ error: 'Pi payment already in use', requestId }, { status: 409 });
    }

    // ---- Verify against Pi's own record ---------------------------------
    let piPayment;
    try {
      piPayment = await getPayment(piPaymentId);
    } catch (err) {
      logger.error(`[${requestId}] Pi getPayment failed:`, err instanceof Error ? err.message : err);
      return NextResponse.json({ error: 'Could not verify payment with Pi Network', requestId }, { status: 502 });
    }

    const referencedPaymentId = (piPayment.metadata as { paymentId?: string } | undefined)?.paymentId;
    const problems: string[] = [];
    if (Math.abs(piPayment.amount - payment.amount) > AMOUNT_TOLERANCE) {problems.push('amount mismatch');}
    if (referencedPaymentId !== payment.id) {problems.push('payment reference mismatch');}
    if (piPayment.direction && piPayment.direction !== 'user_to_app') {problems.push('wrong direction');}
    if (piPayment.status?.cancelled || piPayment.status?.user_cancelled) {problems.push('payment cancelled');}

    if (problems.length > 0) {
      logger.warn(`[${requestId}] Pi payment rejected: ${problems.join(', ')}`);
      return NextResponse.json({ error: 'Payment verification failed', requestId }, { status: 400 });
    }

    // ---- Bind piPaymentId to this payment (atomic) -----------------------
    const bound = await prisma.payment.updateMany({
      where: {
        id: payment.id,
        status: 'pending',
        OR: [{ piPaymentId: null }, { piPaymentId }],
      },
      data: { piPaymentId },
    });
    if (bound.count === 0) {
      return NextResponse.json({ error: 'Payment state changed, retry', requestId }, { status: 409 });
    }

    // ---- Approve on Pi ---------------------------------------------------
    if (!piPayment.status?.developer_approved) {
      try {
        await approvePayment(piPaymentId);
      } catch (err) {
        // Pi may reject a duplicate approve; re-check its real state.
        let approvedNow = false;
        try {
          approvedNow = Boolean((await getPayment(piPaymentId)).status?.developer_approved);
        } catch {
          /* fall through */
        }
        if (!approvedNow) {
          logger.error(`[${requestId}] Pi approve failed:`, err instanceof Error ? err.message : err);
          return NextResponse.json({ error: 'Pi Network approval failed', requestId }, { status: 502 });
        }
      }
    }

    // ---- Persist ---------------------------------------------------------
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.payment.updateMany({
        where: { id: payment.id, status: 'pending' },
        data: {
          status: 'approved',
          metadata: {
            ...((payment.metadata as object) || {}),
            approvedAt: new Date().toISOString(),
            requestId,
          },
        },
      });
      if (payment.bookingId) {
        await tx.booking.updateMany({
          where: { id: payment.bookingId, paymentStatus: 'unpaid' },
          data: { paymentStatus: 'processing' },
        });
      }
    });

    return NextResponse.json({ success: true, paymentId, piPaymentId, status: 'approved', requestId });
  } catch (error) {
    logger.error(`[${requestId}] approve error:`, error);
    return NextResponse.json({ error: 'Payment approval failed', requestId }, { status: 500 });
  }
}
