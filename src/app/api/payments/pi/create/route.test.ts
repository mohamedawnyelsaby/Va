// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const m = vi.hoisted(() => ({
  requireUser: vi.fn(),
  findBooking: vi.fn(),
  createPayment: vi.fn(),
  updatePayment: vi.fn(),
  toPiAmount: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({ checkRateLimit: vi.fn().mockResolvedValue(null) }));
vi.mock('@/lib/auth/guards', () => ({ requireUser: m.requireUser }));
vi.mock('@/lib/logger', () => ({ logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock('@/lib/monitoring/sentry', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/pricing', () => ({ toPiAmount: m.toPiAmount }));
vi.mock('@/lib/db', () => ({
  prisma: {
    booking: { findUnique: m.findBooking },
    payment: { create: m.createPayment, update: m.updatePayment },
  },
}));

import { POST } from '@/app/api/payments/pi/create/route';

const req = (body: unknown, headers: Record<string, string> = {}) =>
  new NextRequest('http://localhost/api/payments/pi/create', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });

const booking = (over: Record<string, unknown> = {}) => ({
  id: 'b1',
  userId: 'u1',
  status: 'pending',
  paymentStatus: 'unpaid',
  totalPrice: 100,
  currency: 'USD',
  itemName: 'Hotel',
  payments: [],
  ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
  m.requireUser.mockResolvedValue({ userId: 'u1' });
  m.toPiAmount.mockReturnValue(31.4);
  m.createPayment.mockResolvedValue({ id: 'pay1' });
});

describe('POST /api/payments/pi/create', () => {
  it('requires a session', async () => {
    const { NextResponse } = await import('next/server');
    m.requireUser.mockResolvedValue({ response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) });
    expect((await POST(req({ bookingId: 'b1' }))).status).toBe(401);
  });

  it('creates one payment from the DB amount, ignoring any amount/memo in the body', async () => {
    m.findBooking.mockResolvedValue(booking());
    const res = await POST(req({ bookingId: 'b1', amount: 0.0001, memo: 'x' }));
    expect(res.status).toBe(200);
    expect(m.createPayment.mock.calls[0][0].data.amount).toBe(31.4);
  });

  it.each(['approved', 'created', 'completed'])(
    'rejects a duplicate when the booking already has a %s payment',
    async (status) => {
      m.findBooking.mockResolvedValue(booking({ payments: [{ id: 'p0', status, piPaymentId: 'x' }] }));
      const res = await POST(req({ bookingId: 'b1' }));
      expect(res.status).toBe(409);
      expect(m.createPayment).not.toHaveBeenCalled();
    }
  );

  it('reuses a pending unlinked payment instead of creating a second one', async () => {
    m.findBooking.mockResolvedValue(booking({ payments: [{ id: 'p0', status: 'pending', piPaymentId: null }] }));
    m.updatePayment.mockResolvedValue({ id: 'p0' });
    const res = await POST(req({ bookingId: 'b1' }));
    expect(res.status).toBe(200);
    expect(m.createPayment).not.toHaveBeenCalled();
    expect((await res.json()).paymentId).toBe('p0');
  });

  it('rejects a zero / invalid amount', async () => {
    m.findBooking.mockResolvedValue(booking());
    for (const bad of [0, -5, Number.NaN, 2_000_000]) {
      m.toPiAmount.mockReturnValue(bad);
      expect((await POST(req({ bookingId: 'b1' }))).status).toBe(400);
    }
    expect(m.createPayment).not.toHaveBeenCalled();
  });

  it('replays an Idempotency-Key without creating a new payment', async () => {
    m.findBooking.mockResolvedValue(
      booking({ payments: [{ id: 'p0', status: 'pending', piPaymentId: null, amount: 31.4, idempotencyKey: 'u1:b1:retry-key-123', metadata: { memo: 'm' } }] })
    );
    const res = await POST(req({ bookingId: 'b1' }, { 'idempotency-key': 'retry-key-123' }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toMatchObject({ paymentId: 'p0', replayed: true });
    expect(m.createPayment).not.toHaveBeenCalled();
  });

  it('rejects a malformed Idempotency-Key', async () => {
    m.findBooking.mockResolvedValue(booking());
    expect((await POST(req({ bookingId: 'b1' }, { 'idempotency-key': 'a b' }))).status).toBe(400);
  });

  it('answers 409 (not 500) when the DB unique index catches a lost race', async () => {
    m.findBooking.mockResolvedValue(booking());
    m.createPayment.mockRejectedValue(Object.assign(new Error('unique'), { code: 'P2002' }));
    expect((await POST(req({ bookingId: 'b1' }))).status).toBe(409);
  });

  it("refuses to pay someone else's booking", async () => {
    m.findBooking.mockResolvedValue(booking({ userId: 'other' }));
    expect((await POST(req({ bookingId: 'b1' }))).status).toBe(403);
  });
});
