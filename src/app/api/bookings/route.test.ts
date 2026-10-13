// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

const m = vi.hoisted(() => ({
  tx: {
    booking: { updateMany: vi.fn() },
    payment: { updateMany: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    user: { findUnique: vi.fn(), update: vi.fn() },
  },
  bookingFindUnique: vi.fn(),
  paymentFindFirst: vi.fn(),
}));

vi.mock('@/lib/auth/guards', () => ({ requireUser: vi.fn().mockResolvedValue({ userId: 'u1' }) }));
vi.mock('@/lib/monitoring/sentry', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/email/notifications', () => ({ sendRefundRequestEmail: vi.fn() }));
vi.mock('@/lib/db', () => ({
  prisma: {
    $transaction: (fn: (t: typeof m.tx) => unknown) => fn(m.tx),
    booking: { findUnique: m.bookingFindUnique },
    payment: { findFirst: m.paymentFindFirst },
  },
}));

import { PATCH } from '@/app/api/bookings/route';

const cancel = () =>
  PATCH(
    new Request('http://localhost/api/bookings', {
      method: 'PATCH',
      body: JSON.stringify({ bookingId: 'b1' }),
    }) as unknown as NextRequest
  );

const paidBooking = { id: 'b1', userId: 'u1', bookingCode: 'C1', itemName: 'Hotel', totalPrice: 10, currency: 'USD', user: { email: 'a@b.c', name: 'A', piWalletId: 'w' } };

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.ADMIN_EMAIL;
  m.bookingFindUnique.mockResolvedValue(paidBooking);
  m.paymentFindFirst.mockResolvedValue({ piTxid: 'tx' });
  // 1st updateMany = "cancel unpaid" (no match: it is paid); 2nd = refund request (match)
  m.tx.booking.updateMany.mockResolvedValueOnce({ count: 0 }).mockResolvedValueOnce({ count: 1 });
  m.tx.payment.findFirst.mockResolvedValue({
    id: 'pay_1',
    userId: 'u1',
    metadata: { cashback: 0.2, memo: 'm' },
  });
  m.tx.user.findUnique.mockResolvedValue({ piBalance: 5 });
});

describe('PATCH /api/bookings — refund request reverses cashback', () => {
  it('deducts the cashback that was credited for this booking', async () => {
    const res = await cancel();
    expect((await res.json()).status).toBe('refund_requested');
    expect(m.tx.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { piBalance: { decrement: 0.2 } },
    });
    expect(m.tx.payment.update.mock.calls[0][0].data.metadata).toMatchObject({
      memo: 'm',
      cashbackReversed: 0.2,
    });
  });

  it('never drives the balance negative: reverses only what is left', async () => {
    m.tx.user.findUnique.mockResolvedValue({ piBalance: 0.05 });
    await cancel();
    expect(m.tx.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { piBalance: { decrement: 0.05 } },
    });
  });

  it('skips the balance update when there is nothing to reverse', async () => {
    m.tx.user.findUnique.mockResolvedValue({ piBalance: 0 });
    const res = await cancel();
    expect(res.status).toBe(200);
    expect(m.tx.user.update).not.toHaveBeenCalled();
  });

  it('does nothing to the balance when the booking is no longer refundable', async () => {
    m.tx.booking.updateMany.mockReset();
    m.tx.booking.updateMany.mockResolvedValue({ count: 0 });
    const res = await cancel();
    expect(res.status).toBe(400);
    expect(m.tx.user.update).not.toHaveBeenCalled();
  });
});
