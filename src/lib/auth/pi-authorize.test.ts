// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({ verifyPiUser: vi.fn(), upsert: vi.fn() }));

vi.mock('@/lib/db', () => ({ prisma: { user: { upsert: m.upsert, findUnique: vi.fn() } } }));
vi.mock('@/lib/monitoring/sentry', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/logger', () => ({ logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock('@/lib/pi-network/platform-api', () => ({ verifyPiUser: m.verifyPiUser }));

import { authOptions } from '@/lib/auth/options';
import { clearVerifiedTokens } from '@/lib/pi-network/verified-token-cache';

// next-auth keeps the options passed to CredentialsProvider() under `.options`
// (the top-level `id` stays 'credentials'), so match on options.id.
type PiProvider = {
  options: { id: string; authorize: (c: Record<string, string> | undefined) => Promise<unknown> };
};
const piProvider = (authOptions.providers as unknown as PiProvider[]).find(
  (p) => p.options?.id === 'pi-network'
) as PiProvider;
const authorize = (c: Record<string, string> | undefined) => piProvider.options.authorize(c);

const activeUser = { id: 'u1', name: 'alice', email: 'p1@pi.network', isActive: true };

beforeEach(() => {
  vi.clearAllMocks();
  clearVerifiedTokens();
});

describe('pi-network authorize', () => {
  it('rejects missing accessToken or uid without calling Pi', async () => {
    expect(await authorize(undefined)).toBeNull();
    expect(await authorize({ uid: 'p1' })).toBeNull();
    expect(await authorize({ accessToken: 't' })).toBeNull();
    expect(m.verifyPiUser).not.toHaveBeenCalled();
  });

  it('rejects an invalid access token (Pi verification throws) — fail closed', async () => {
    m.verifyPiUser.mockRejectedValue(new Error('Failed to verify Pi user token'));
    await expect(authorize({ accessToken: 'bad', uid: 'p1' })).rejects.toThrow('PiVerifyFailed');
    expect(m.upsert).not.toHaveBeenCalled();
  });

  it('rejects a uid that does not match the one Pi returns', async () => {
    m.verifyPiUser.mockResolvedValue({ uid: 'victim', username: 'victim' });
    await expect(authorize({ accessToken: 't', uid: 'attacker-claimed-uid' })).rejects.toThrow('PiUidMismatch');
    expect(m.upsert).not.toHaveBeenCalled();
  });

  it('rejects inactive users', async () => {
    m.verifyPiUser.mockResolvedValue({ uid: 'p1', username: 'alice' });
    m.upsert.mockResolvedValue({ ...activeUser, isActive: false });
    await expect(authorize({ accessToken: 't', uid: 'p1' })).rejects.toThrow('AccountInactive');
  });

  it('reuses a token that was just verified, but never for a different uid', async () => {
    const { rememberVerifiedToken } = await import('@/lib/pi-network/verified-token-cache');
    rememberVerifiedToken('cached-token', 'p1', 'alice');
    m.upsert.mockResolvedValue(activeUser);
    expect(await authorize({ accessToken: 'cached-token', uid: 'p1' })).toMatchObject({ id: 'u1' });
    expect(m.verifyPiUser).not.toHaveBeenCalled();

    // Same token, a uid the cache did not verify: must go to Pi (and be rejected here).
    m.verifyPiUser.mockResolvedValue({ uid: 'p1', username: 'alice' });
    await expect(authorize({ accessToken: 'cached-token', uid: 'victim' })).rejects.toThrow('PiUidMismatch');
    expect(m.verifyPiUser).toHaveBeenCalledTimes(1);
  });

  it('accepts a verified, matching, active user and never stores the token', async () => {
    m.verifyPiUser.mockResolvedValue({ uid: 'p1', username: 'alice' });
    m.upsert.mockResolvedValue(activeUser);
    const out = await authorize({ accessToken: 'secret-token', uid: 'p1' });
    expect(out).toMatchObject({ id: 'u1' });
    expect(JSON.stringify(m.upsert.mock.calls)).not.toContain('secret-token');
  });
});
