// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

const m = vi.hoisted(() => ({
  paymentCount: vi.fn(),
  userDelete: vi.fn(),
  userUpdate: vi.fn(),
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({ user: { id: 'u1' } }),
}));
vi.mock('@/lib/auth/options', () => ({ authOptions: {} }));
vi.mock('@/lib/db', () => ({
  prisma: {
    payment: { count: m.paymentCount },
    user: { delete: m.userDelete, update: m.userUpdate },
  },
}));

import { DELETE, PATCH } from '@/app/api/user/route';

const del = (body: unknown = { confirm: 'DELETE' }) =>
  DELETE(
    new Request('http://localhost/api/user', { method: 'DELETE', body: JSON.stringify(body) }) as unknown as NextRequest
  );

const patch = (body: unknown) =>
  PATCH(
    new Request('http://localhost/api/user', { method: 'PATCH', body: JSON.stringify(body) }) as unknown as NextRequest
  );

beforeEach(() => {
  vi.clearAllMocks();
  m.paymentCount.mockResolvedValue(0);
  m.userDelete.mockResolvedValue({});
  m.userUpdate.mockResolvedValue({ id: 'u1' });
});

describe('DELETE /api/user', () => {
  it('requires the explicit confirmation', async () => {
    expect((await del({})).status).toBe(400);
    expect(m.userDelete).not.toHaveBeenCalled();
  });

  it('refuses with 409 when the account has payment history (deletion would cascade into it)', async () => {
    m.paymentCount.mockResolvedValue(1);
    const res = await del();
    expect(res.status).toBe(409);
    expect(m.userDelete).not.toHaveBeenCalled();
    expect(m.paymentCount.mock.calls[0][0].where.userId).toBe('u1');
  });

  it('deletes an account with no payment trail', async () => {
    const res = await del();
    expect(res.status).toBe(200);
    expect(m.userDelete).toHaveBeenCalledWith({ where: { id: 'u1' } });
  });
});

describe('PATCH /api/user profile image', () => {
  it('rejects an https image from a host next/image is not configured for', async () => {
    const res = await patch({ image: 'https://evil.example.com/a.png' });
    expect(res.status).toBe(400);
    expect(m.userUpdate).not.toHaveBeenCalled();
  });

  it('accepts an image from an allowed host', async () => {
    const res = await patch({ image: 'https://res.cloudinary.com/demo/a.png' });
    expect(res.status).toBe(200);
  });
});
