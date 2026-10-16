// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

const m = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  hotelFindUnique: vi.fn(),
  reviewFindFirst: vi.fn(),
  bookingFindFirst: vi.fn(),
  tx: {
    review: { create: vi.fn(), aggregate: vi.fn() },
    hotel: { update: vi.fn() },
  },
}));

vi.mock('next-auth', () => ({ getServerSession: m.getServerSession }));
vi.mock('@/lib/auth/options', () => ({ authOptions: {} }));
vi.mock('@/lib/rate-limit', () => ({ checkRateLimit: vi.fn().mockResolvedValue(null) }));
vi.mock('@/lib/monitoring/sentry', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/db', () => ({
  prisma: {
    $transaction: (fn: (t: typeof m.tx) => unknown) => fn(m.tx),
    hotel: { findUnique: m.hotelFindUnique },
    review: { findFirst: m.reviewFindFirst },
    booking: { findFirst: m.bookingFindFirst },
  },
}));

import { POST } from '@/app/api/reviews/route';

const review = () =>
  POST(
    new Request('http://localhost/api/reviews', {
      method: 'POST',
      body: JSON.stringify({
        itemId: 'h1',
        itemType: 'hotel',
        rating: 5,
        title: 'Great stay',
        comment: 'Really enjoyed the whole stay here, would come back.',
      }),
    }) as unknown as NextRequest
  );

beforeEach(() => {
  vi.clearAllMocks();
  m.getServerSession.mockResolvedValue({ user: { id: 'u1' } });
  m.hotelFindUnique.mockResolvedValue({ id: 'h1' });
  m.reviewFindFirst.mockResolvedValue(null);
  m.bookingFindFirst.mockResolvedValue(null);
  m.tx.review.create.mockImplementation(async ({ data }: { data: object }) => ({ id: 'r1', ...data }));
  m.tx.review.aggregate.mockResolvedValue({ _avg: { rating: 5 }, _count: { rating: 1 } });
});

describe('POST /api/reviews — verified flag', () => {
  it('marks the review verified when the user has a paid booking for that item', async () => {
    m.bookingFindFirst.mockResolvedValue({ id: 'b1' });
    const res = await review();
    expect(res.status).toBe(201);
    expect(m.tx.review.create.mock.calls[0][0].data.verified).toBe(true);
  });

  it('still accepts the review, unverified, when there is no paid booking', async () => {
    const res = await review();
    expect(res.status).toBe(201);
    expect(m.tx.review.create.mock.calls[0][0].data.verified).toBe(false);
  });

  it('only counts a PAID booking for this exact user and item', async () => {
    await review();
    expect(m.bookingFindFirst.mock.calls[0][0].where).toMatchObject({
      userId: 'u1',
      itemId: 'h1',
      itemType: 'hotel',
      paymentStatus: 'paid',
    });
  });

  it('requires a signed-in user (this is what a revoked session turns into)', async () => {
    m.getServerSession.mockResolvedValue(null);
    expect((await review()).status).toBe(401);
    expect(m.tx.review.create).not.toHaveBeenCalled();
  });
});
