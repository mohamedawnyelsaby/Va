// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({ findUnique: vi.fn() }));

vi.mock('@/lib/db', () => ({ prisma: { user: { findUnique: m.findUnique } } }));
vi.mock('@/lib/monitoring/sentry', () => ({ captureException: vi.fn() }));

import { authOptions } from '@/lib/auth/options';
import { sessionVersion } from '@/lib/auth/session-version';

type JwtCb = NonNullable<NonNullable<typeof authOptions.callbacks>['jwt']>;
const jwt = (args: Record<string, unknown>) => (authOptions.callbacks!.jwt as JwtCb)(args as never);

const HASH = '$2a$12$currentpasswordhash';
const activeUser = (over: Record<string, unknown> = {}) => ({ isActive: true, password: HASH, ...over });

beforeEach(() => vi.clearAllMocks());

describe('jwt callback — session revocation (token reads after sign-in)', () => {
  it('keeps a valid session untouched', async () => {
    m.findUnique.mockResolvedValue(activeUser());
    const token = { id: 'u1', sv: sessionVersion(HASH) };
    await expect(jwt({ token })).resolves.toMatchObject({ id: 'u1' });
  });

  it('revokes when the password changed after the token was issued', async () => {
    m.findUnique.mockResolvedValue(activeUser({ password: '$2a$12$NEWpasswordhash' }));
    await expect(jwt({ token: { id: 'u1', sv: sessionVersion(HASH) } })).rejects.toThrow(
      'SESSION_REVOKED'
    );
  });

  it('revokes when a password was REMOVED (e.g. Google pre-hijack cleanup)', async () => {
    m.findUnique.mockResolvedValue(activeUser({ password: null }));
    await expect(jwt({ token: { id: 'u1', sv: sessionVersion(HASH) } })).rejects.toThrow(
      'SESSION_REVOKED'
    );
  });

  it('revokes a deactivated account', async () => {
    m.findUnique.mockResolvedValue(activeUser({ isActive: false }));
    await expect(jwt({ token: { id: 'u1', sv: sessionVersion(HASH) } })).rejects.toThrow(
      'SESSION_REVOKED'
    );
  });

  it('revokes when the user no longer exists', async () => {
    m.findUnique.mockResolvedValue(null);
    await expect(jwt({ token: { id: 'ghost', sv: 'x' } })).rejects.toThrow('SESSION_REVOKED');
  });

  it('adopts the current state for tokens issued BEFORE this check existed (no mass logout)', async () => {
    m.findUnique.mockResolvedValue(activeUser());
    const out = await jwt({ token: { id: 'u1' } });
    expect(out.sv).toBe(sessionVersion(HASH));
  });

  it('a legacy token is still revoked if the account is inactive', async () => {
    m.findUnique.mockResolvedValue(activeUser({ isActive: false }));
    await expect(jwt({ token: { id: 'u1' } })).rejects.toThrow('SESSION_REVOKED');
  });

  it('passwordless accounts (Pi/Google) stay valid and are not revoked spuriously', async () => {
    m.findUnique.mockResolvedValue(activeUser({ password: null }));
    const token = { id: 'pi1', sv: sessionVersion(null) };
    await expect(jwt({ token })).resolves.toMatchObject({ id: 'pi1' });
  });
});

describe('jwt callback — sign-in', () => {
  it('stamps role, tier and the credentials fingerprint into the new token', async () => {
    m.findUnique.mockResolvedValue({ role: 'admin', tier: 'pro', password: HASH });
    const out = await jwt({
      token: { sub: 'u1' },
      user: { id: 'u1' },
      account: { provider: 'credentials' },
    });
    expect(out).toMatchObject({ id: 'u1', role: 'admin', tier: 'pro', sv: sessionVersion(HASH) });
  });

  it('a token issued at sign-in is accepted by the very next revalidation', async () => {
    m.findUnique.mockResolvedValue({ role: 'user', tier: 'free', password: HASH });
    const issued = await jwt({ token: {}, user: { id: 'u1' }, account: { provider: 'credentials' } });

    m.findUnique.mockResolvedValue(activeUser());
    await expect(jwt({ token: issued })).resolves.toMatchObject({ id: 'u1' });
  });

  it('fails closed when the Google-linked user cannot be found', async () => {
    m.findUnique.mockResolvedValue(null);
    await expect(
      jwt({ token: { email: 'a@b.c' }, user: { id: 'g1' }, account: { provider: 'google' } })
    ).rejects.toThrow('Google-linked user not found');
  });
});
