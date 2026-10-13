// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

const m = vi.hoisted(() => ({
  getPayment: vi.fn(),
  cancelPayment: vi.fn(),
  finalizePayment: vi.fn(),
  paymentFindFirst: vi.fn(),
  paymentUpdateMany: vi.fn(),
  bookingUpdateMany: vi.fn(),
  userFindUnique: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({ checkRateLimit: vi.fn().mockResolvedValue(null) }));
vi.mock('@/lib/auth/guards', () => ({
  requireUser: vi.fn().mockResolvedValue({ userId: 'u1' }),
}));
vi.mock('@/lib/monitoring/sentry', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/pi-network/platform-api', () => ({
  getPayment: m.getPayment,
  cancelPayment: m.cancelPayment,
}));
vi.mock('@/lib/payments/finalize', () => ({ finalizePayment: m.finalizePayment }));
vi.mock('@/lib/db', () => ({
  prisma: {
    payment: { findFirst: m.paymentFindFirst, updateMany: m.paymentUpdateMany },
    booking: { updateMany: m.bookingUpdateMany },
    user: { findUnique: m.userFindUnique },
  },
}));

import { POST } from '@/app/api/payments/pi/recover/route';

const PI_ID = 'pi_payment_123456';
const call = () =>
  POST(
    new Request('http://localhost/api/payments/pi/recover', {
      method: 'POST',
      body: JSON.stringify({ piPaymentId: PI_ID }),
    }) as unknown as NextRequest
  );

const ourPayment = {
  id: 'pay_1',
  userId: 'u1',
  bookingId: 'b1',
  status: 'approved',
  amount: 10,
  piPaymentId: PI_ID,
};

const piPayment = (over: Record<string, unknown> = {}) => ({
  identifier: PI_ID,
  user_uid: 'pi_uid_1',
  amount: 10,
  direction: 'user_to_app',
  metadata: { paymentId: 'pay_1' },
  status: { developer_approved: true, developer_completed: false, cancelled: false, user_cancelled: false },
  transaction: { txid: 'tx_1', verified: true },
  ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
  m.paymentFindFirst.mockResolvedValue(ourPayment);
  m.getPayment.mockResolvedValue(piPayment());
  m.finalizePayment.mockResolvedValue({ finalized: true, cashback: 0.2 });
  m.userFindUnique.mockResolvedValue({ piWalletId: 'pi_uid_1' });
});

describe('POST /api/payments/pi/recover — finalize path', () => {
  it('finalizes when Pi\'s record matches ours', async () => {
    const res = await call();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.resolved).toBe('finalized');
    expect(m.finalizePayment).toHaveBeenCalledTimes(1);
  });

  it('refuses when the Pi amount differs from our payment amount', async () => {
    m.getPayment.mockResolvedValue(piPayment({ amount: 0.0001 }));
    const res = await call();
    expect(res.status).toBe(409);
    expect(m.finalizePayment).not.toHaveBeenCalled();
  });

  it('refuses when Pi\'s metadata points at a different internal payment', async () => {
    m.getPayment.mockResolvedValue(piPayment({ metadata: { paymentId: 'someone_elses' } }));
    m.paymentFindFirst.mockResolvedValue({ ...ourPayment, id: 'pay_1' });
    const res = await call();
    expect(res.status).toBe(409);
    expect(m.finalizePayment).not.toHaveBeenCalled();
  });

  it('refuses when our payment was never linked to this Pi payment', async () => {
    m.paymentFindFirst.mockResolvedValue({ ...ourPayment, piPaymentId: null });
    const res = await call();
    expect(res.status).toBe(409);
    expect(m.finalizePayment).not.toHaveBeenCalled();
  });

  it('refuses an app-to-user payment', async () => {
    m.getPayment.mockResolvedValue(piPayment({ direction: 'app_to_user' }));
    const res = await call();
    expect(res.status).toBe(409);
    expect(m.finalizePayment).not.toHaveBeenCalled();
  });
});

describe('POST /api/payments/pi/recover — orphaned Pi payments', () => {
  beforeEach(() => {
    m.paymentFindFirst.mockResolvedValue(null);
    m.getPayment.mockResolvedValue(
      piPayment({ transaction: undefined, status: { developer_approved: false } })
    );
  });

  it('cancels an orphan that belongs to the caller\'s own Pi account', async () => {
    const res = await call();
    expect((await res.json()).resolved).toBe('orphaned');
    expect(m.cancelPayment).toHaveBeenCalledWith(PI_ID);
  });

  it('does NOT cancel a Pi payment that belongs to someone else', async () => {
    m.getPayment.mockResolvedValue(
      piPayment({
        user_uid: 'a_different_pi_user',
        transaction: undefined,
        status: { developer_approved: false },
      })
    );
    const res = await call();
    expect(res.status).toBe(200);
    expect(m.cancelPayment).not.toHaveBeenCalled();
  });

  it('does not cancel anything for a caller with no Pi account', async () => {
    m.userFindUnique.mockResolvedValue({ piWalletId: null });
    await call();
    expect(m.cancelPayment).not.toHaveBeenCalled();
  });
});
