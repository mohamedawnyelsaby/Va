// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

const m = vi.hoisted(() => ({
  verifyPiUser: vi.fn(),
  captureException: vi.fn(),
  userFindUnique: vi.fn(),
  txUpsert: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({ logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue(null),
  getClientId: () => '1.2.3.4',
}));
vi.mock('@/lib/monitoring/sentry', () => ({
  captureException: m.captureException,
  captureMessage: vi.fn(),
}));
vi.mock('@/lib/pi-network/platform-api', () => ({ verifyPiUser: m.verifyPiUser }));
vi.mock('@/lib/pi-network/verified-token-cache', () => ({
  getVerifiedToken: vi.fn().mockReturnValue(null),
  rememberVerifiedToken: vi.fn(),
}));
vi.mock('@/lib/db', () => ({
  prisma: {
    securityLog: { create: vi.fn().mockResolvedValue({}) },
    user: { findUnique: m.userFindUnique },
    $transaction: (fn: (t: unknown) => unknown) =>
      fn({
        user: { upsert: m.txUpsert },
        auditLog: { create: vi.fn() },
        securityLog: { create: vi.fn() },
      }),
  },
}));

import { POST } from '@/app/api/auth/pi/verify/route';
import { checkRateLimit } from '@/lib/rate-limit';

const call = () =>
  POST(
    new Request('http://localhost/api/auth/pi/verify', {
      method: 'POST',
      body: JSON.stringify({ accessToken: 'tok', uid: 'pi_1' }),
    }) as unknown as NextRequest
  );

beforeEach(() => {
  vi.clearAllMocks();
  m.userFindUnique.mockResolvedValue(null);
  m.txUpsert.mockResolvedValue({ id: 'u1' });
});

describe('POST /api/auth/pi/verify', () => {
  it('uses the dedicated piVerify rate-limit tier', async () => {
    m.verifyPiUser.mockResolvedValue({ uid: 'pi_1', username: 'a' });
    await call();
    expect(checkRateLimit).toHaveBeenCalledWith(expect.anything(), 'piVerify');
  });

  it('answers 401 for a token Pi rejected, and does not report it to Sentry', async () => {
    m.verifyPiUser.mockRejectedValue(new Error('Invalid Pi access token'));
    const res = await call();
    expect(res.status).toBe(401);
    expect(m.captureException).not.toHaveBeenCalled();
  });

  it('answers 503 when Pi is unavailable, and does not report it to Sentry', async () => {
    m.verifyPiUser.mockRejectedValue(new Error('Pi service unavailable'));
    const res = await call();
    expect(res.status).toBe(503);
    expect(m.captureException).not.toHaveBeenCalled();
  });

  it('still reports unexpected failures to Sentry and answers 500', async () => {
    m.verifyPiUser.mockRejectedValue(new Error('boom'));
    const res = await call();
    expect(res.status).toBe(500);
    expect(m.captureException).toHaveBeenCalledTimes(1);
  });

  it('refuses a deactivated account with 403 and does not touch it', async () => {
    m.verifyPiUser.mockResolvedValue({ uid: 'pi_1', username: 'a' });
    m.userFindUnique.mockResolvedValue({ isActive: false });
    const res = await call();
    expect(res.status).toBe(403);
    expect(m.txUpsert).not.toHaveBeenCalled();
  });

  it('verifies an active account', async () => {
    m.verifyPiUser.mockResolvedValue({ uid: 'pi_1', username: 'a' });
    m.userFindUnique.mockResolvedValue({ isActive: true });
    const res = await call();
    expect(res.status).toBe(200);
    expect((await res.json()).verified).toBe(true);
  });
});
