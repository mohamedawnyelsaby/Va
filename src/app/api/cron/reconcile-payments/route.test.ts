// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { NextRequest } from 'next/server';

const m = vi.hoisted(() => ({
  findMany: vi.fn(),
  getPayment: vi.fn(),
  reconcile: vi.fn(),
}));

vi.mock('@/lib/monitoring/sentry', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/db', () => ({ prisma: { payment: { findMany: m.findMany } } }));
vi.mock('@/lib/pi-network/platform-api', () => ({ getPayment: m.getPayment }));
vi.mock('@/lib/payments/reconcile', () => ({ reconcilePiPayment: m.reconcile }));

import { GET } from '@/app/api/cron/reconcile-payments/route';

const SECRET = 'test-cron-secret-value';
const call = (auth?: string) =>
  GET(
    new Request('http://localhost/api/cron/reconcile-payments', {
      headers: auth ? { authorization: auth } : {},
    }) as unknown as NextRequest
  );

const row = (id: string) => ({ id, bookingId: `b_${id}`, status: 'approved', amount: 5, piPaymentId: `pi_${id}` });

beforeEach(() => {
  vi.clearAllMocks();
  process.env.CRON_SECRET = SECRET;
  m.findMany.mockResolvedValue([]);
  m.getPayment.mockResolvedValue({ identifier: 'x' });
  m.reconcile.mockResolvedValue({ resolved: 'finalized' });
});
afterEach(() => {
  delete process.env.CRON_SECRET;
});

describe('GET /api/cron/reconcile-payments — auth', () => {
  it('is closed (503) when CRON_SECRET is not configured, even with a header', async () => {
    delete process.env.CRON_SECRET;
    expect((await call('Bearer anything')).status).toBe(503);
    expect(m.findMany).not.toHaveBeenCalled();
  });

  it('rejects a missing or wrong secret with 401 and does no work', async () => {
    expect((await call()).status).toBe(401);
    expect((await call('Bearer wrong-secret-value-xx')).status).toBe(401);
    expect((await call(`Bearer ${SECRET}x`)).status).toBe(401);
    expect(m.findMany).not.toHaveBeenCalled();
  });

  it('accepts the exact Vercel cron header', async () => {
    expect((await call(`Bearer ${SECRET}`)).status).toBe(200);
  });
});

describe('GET /api/cron/reconcile-payments — sweep', () => {
  it('only selects stale, linked, unsettled payments (bounded batch)', async () => {
    await call(`Bearer ${SECRET}`);
    const q = m.findMany.mock.calls[0][0];
    expect(q.where.status).toEqual({ in: ['pending', 'approved'] });
    expect(q.where.piPaymentId).toEqual({ not: null });
    expect(q.where.createdAt.lt).toBeInstanceOf(Date);
    expect(q.where.createdAt.gt).toBeInstanceOf(Date);
    expect(q.take).toBe(25);
  });

  it('reconciles each payment and returns a summary', async () => {
    m.findMany.mockResolvedValue([row('a'), row('b'), row('c')]);
    m.reconcile
      .mockResolvedValueOnce({ resolved: 'finalized' })
      .mockResolvedValueOnce({ resolved: 'cancelled' })
      .mockResolvedValueOnce({ resolved: 'finalized' });
    const body = await (await call(`Bearer ${SECRET}`)).json();
    expect(body).toEqual({ checked: 3, summary: { finalized: 2, cancelled: 1 } });
    expect(m.reconcile.mock.calls[0][0]).toMatchObject({ piPaymentId: 'pi_a', source: 'reconcile' });
  });

  it('one failing payment does not stop the rest', async () => {
    m.findMany.mockResolvedValue([row('a'), row('b')]);
    m.getPayment.mockRejectedValueOnce(new Error('Pi down')).mockResolvedValueOnce({ identifier: 'b' });
    const body = await (await call(`Bearer ${SECRET}`)).json();
    expect(body.summary).toEqual({ error: 1, finalized: 1 });
    expect(m.reconcile).toHaveBeenCalledTimes(1);
  });
});
