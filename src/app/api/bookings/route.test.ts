// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

const m = vi.hoisted(() => ({
  hotelFindUnique: vi.fn(),
  bookingFindFirst: vi.fn(),
  bookingCreate: vi.fn(),
  tx: {
    $executeRaw: vi.fn(),
    booking: { updateMany: vi.fn(), aggregate: vi.fn(), create: vi.fn() },
    payment: { updateMany: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    paymentEvent: { create: vi.fn() },
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
    booking: {
      findUnique: m.bookingFindUnique,
      findFirst: m.bookingFindFirst,
      create: m.bookingCreate,
    },
    hotel: { findUnique: m.hotelFindUnique },
    payment: { findFirst: m.paymentFindFirst },
  },
}));

import { PATCH, POST } from '@/app/api/bookings/route';

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

  it('records when and why the refund was requested, once, with an audit event', async () => {
    m.tx.payment.updateMany.mockResolvedValue({ count: 1 });
    await PATCH(
      new Request('http://localhost/api/bookings', {
        method: 'PATCH',
        body: JSON.stringify({ bookingId: 'b1', reason: 'Plans changed' }),
      }) as unknown as NextRequest
    );
    expect(m.tx.payment.updateMany).toHaveBeenCalledWith({
      where: { id: 'pay_1', status: 'completed', refundRequestedAt: null },
      data: { refundRequestedAt: expect.any(Date), refundReason: 'Plans changed' },
    });
    expect(m.tx.paymentEvent.create).toHaveBeenCalledTimes(1);
  });

  it('does not write a second audit event when a refund was already requested', async () => {
    m.tx.payment.updateMany.mockResolvedValue({ count: 0 });
    await cancel();
    expect(m.tx.paymentEvent.create).not.toHaveBeenCalled();
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


/* ---------------- POST: overbooking protection ---------------- */

const day = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString();
const book = (over: Record<string, unknown> = {}) =>
  POST(
    new Request('http://localhost/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        type: 'hotel',
        itemId: 'h1',
        startDate: day(10),
        endDate: day(12),
        guests: 2,
        rooms: 1,
        roomType: 'Deluxe',
        ...over,
      }),
    }) as unknown as NextRequest
  );

const hotelWith = (totalRooms?: number) => ({
  name: 'Test Hotel',
  pricePerNight: 100,
  currency: 'USD',
  roomTypes: [{ type: 'Deluxe', price: 100, ...(totalRooms ? { totalRooms } : {}) }],
});

describe('POST /api/bookings — overbooking protection', () => {
  beforeEach(() => {
    m.bookingFindFirst.mockResolvedValue(null); // no reusable pending booking
    m.tx.booking.create.mockImplementation(async ({ data }: { data: object }) => ({ id: 'new', ...data }));
    m.bookingCreate.mockImplementation(async ({ data }: { data: object }) => ({ id: 'plain', ...data }));
    m.tx.booking.aggregate.mockResolvedValue({ _sum: { rooms: 0 } });
  });

  it('rejects with 409 when the room type is sold out, and creates nothing', async () => {
    m.hotelFindUnique.mockResolvedValue(hotelWith(2));
    m.tx.booking.aggregate.mockResolvedValue({ _sum: { rooms: 2 } });
    const res = await book();
    expect(res.status).toBe(409);
    expect((await res.json()).error).toMatch(/sold out/i);
    expect(m.tx.booking.create).not.toHaveBeenCalled();
  });

  it('creates the booking when there is room, inside the transaction', async () => {
    m.hotelFindUnique.mockResolvedValue(hotelWith(2));
    m.tx.booking.aggregate.mockResolvedValue({ _sum: { rooms: 1 } });
    const res = await book();
    expect(res.status).toBe(201);
    expect(m.tx.booking.create).toHaveBeenCalledTimes(1);
    expect(m.bookingCreate).not.toHaveBeenCalled();
  });

  it('takes the per-hotel lock BEFORE counting, so concurrent requests serialise', async () => {
    m.hotelFindUnique.mockResolvedValue(hotelWith(2));
    await book();
    expect(m.tx.$executeRaw).toHaveBeenCalledTimes(1);
    expect(m.tx.$executeRaw.mock.invocationCallOrder[0]).toBeLessThan(
      m.tx.booking.aggregate.mock.invocationCallOrder[0]
    );
    expect(m.tx.booking.aggregate.mock.invocationCallOrder[0]).toBeLessThan(
      m.tx.booking.create.mock.invocationCallOrder[0]
    );
  });

  it('refuses a request for more rooms than remain, and reports how many are left', async () => {
    m.hotelFindUnique.mockResolvedValue(hotelWith(2));
    m.tx.booking.aggregate.mockResolvedValue({ _sum: { rooms: 1 } });
    const res = await book({ rooms: 2 });
    expect(res.status).toBe(409);
    expect((await res.json()).error).toContain('only 1');
  });

  it('counts confirmed and in-flight bookings, plus only RECENT unpaid pending ones', async () => {
    m.hotelFindUnique.mockResolvedValue(hotelWith(2));
    await book();
    const { where } = m.tx.booking.aggregate.mock.calls[0][0];
    expect(where.OR).toEqual(
      expect.arrayContaining([
        { status: { in: ['confirmed', 'refund_requested'] } },
        { status: 'pending', paymentStatus: 'processing' },
      ])
    );
    const pending = where.OR.find(
      (c: { status: string; createdAt?: unknown }) => c.status === 'pending' && c.createdAt
    );
    const cutoff = pending.createdAt.gt as Date;
    const ageMin = (Date.now() - cutoff.getTime()) / 60_000;
    expect(ageMin).toBeGreaterThan(59); // holds rooms for ~60 minutes, no longer
    expect(ageMin).toBeLessThan(61);
  });

  it('keeps today\'s behaviour for hotels that declare no totalRooms: no lock, no counting', async () => {
    m.hotelFindUnique.mockResolvedValue(hotelWith(undefined));
    const res = await book();
    expect(res.status).toBe(201);
    expect(m.bookingCreate).toHaveBeenCalledTimes(1);
    expect(m.tx.$executeRaw).not.toHaveBeenCalled();
    expect(m.tx.booking.aggregate).not.toHaveBeenCalled();
  });
});
