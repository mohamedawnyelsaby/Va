// src/app/api/admin/refunds/route.ts
//
// Support / admin visibility and actions for refunds. Admin only (role is
// re-read from the database by requireAdmin).
//
//   GET  /api/admin/refunds?state=requested|processing|refunded|all
//   POST /api/admin/refunds  { paymentId, action: 'send' | 'mark_manual', txid?, note? }

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/guards';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';
import { RefundError, markRefundedManually, processRefund } from '@/lib/payments/refund';

export const dynamic = 'force-dynamic';

const querySchema = z.object({ state: z.enum(['requested', 'processing', 'refunded', 'all']).default('requested') });

const bodySchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('send'), paymentId: z.string().min(1).max(64) }),
  z.object({
    action: z.literal('mark_manual'),
    paymentId: z.string().min(1).max(64),
    txid: z.string().min(8).max(200),
    note: z.string().trim().max(500).optional(),
  }),
]);

export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if ('response' in guard) {return guard.response;}

  const parsed = querySchema.safeParse({ state: request.nextUrl.searchParams.get('state') ?? undefined });
  if (!parsed.success) {return NextResponse.json({ error: 'Invalid state' }, { status: 400 });}

  const where =
    parsed.data.state === 'requested'
      ? { refundRequestedAt: { not: null }, refundedAt: null, refundProcessingAt: null }
      : parsed.data.state === 'processing'
        ? { refundProcessingAt: { not: null }, refundedAt: null }
        : parsed.data.state === 'refunded'
          ? { refundedAt: { not: null } }
          : { refundRequestedAt: { not: null } };

  const payments = await prisma.payment.findMany({
    where,
    orderBy: { refundRequestedAt: 'asc' },
    take: 100,
    select: {
      id: true, status: true, amount: true, piTxid: true, bookingId: true,
      refundRequestedAt: true, refundProcessingAt: true, refundedAt: true,
      refundReason: true, refundTxid: true, refundedBy: true,
      user: { select: { id: true, email: true, piUsername: true } },
      booking: { select: { bookingCode: true, itemName: true } },
      events: { orderBy: { createdAt: 'asc' }, select: { fromStatus: true, toStatus: true, actor: true, reason: true, createdAt: true } },
    },
  });

  return NextResponse.json({ count: payments.length, payments });
}

export async function POST(request: NextRequest) {
  const limited = await checkRateLimit(request, 'payment');
  if (limited) {return limited;}

  const guard = await requireAdmin();
  if ('response' in guard) {return guard.response;}

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    const result =
      body.action === 'send'
        ? await processRefund({ paymentId: body.paymentId, adminId: guard.userId })
        : await markRefundedManually({
            paymentId: body.paymentId,
            adminId: guard.userId,
            txid: body.txid,
            note: body.note,
          });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof RefundError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    logger.error('[admin/refunds] unexpected error:', error);
    return NextResponse.json({ error: 'Refund failed' }, { status: 500 });
  }
}
