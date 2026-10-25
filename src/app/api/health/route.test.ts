// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { NextRequest } from 'next/server';
import { NextRequest as Req } from 'next/server';

vi.mock('@/lib/db', () => ({ prisma: {} }));
vi.mock('@/lib/rate-limit', () => ({ checkRateLimit: vi.fn().mockResolvedValue(null) }));

import { GET } from '@/app/api/health/route';

const call = (host: string) =>
  GET(new Req(`https://${host}/api/health?pi=1`, { headers: { host } }) as unknown as NextRequest);

const original = { ...process.env };
beforeEach(() => {
  process.env.PI_API_KEY = 'SECRET-KEY-VALUE-123';
});
afterEach(() => {
  process.env = { ...original };
});

describe('GET /api/health?pi=1', () => {
  it('reports a testnet host built for sandbox as consistent', async () => {
    process.env.NEXT_PUBLIC_PI_SANDBOX = 'true';
    const { pi } = await (await call('va-pied.vercel.app')).json();
    expect(pi).toMatchObject({ hostExpects: 'testnet', clientNetwork: 'testnet (sandbox)', clientMatchesHost: true, warning: null });
  });

  it('warns when the MAINNET hostname is served by a sandbox build (the dual-domain trap)', async () => {
    process.env.NEXT_PUBLIC_PI_SANDBOX = 'true';
    const { pi } = await (await call('va-mainnet.vercel.app')).json();
    expect(pi.hostExpects).toBe('mainnet');
    expect(pi.clientMatchesHost).toBe(false);
    expect(pi.warning).toMatch(/different Pi network/);
  });

  it('accepts a mainnet hostname served by a non-sandbox build', async () => {
    process.env.NEXT_PUBLIC_PI_SANDBOX = 'false';
    const { pi } = await (await call('va-mainnet.vercel.app')).json();
    expect(pi.clientMatchesHost).toBe(true);
  });

  it('does not judge hostnames it does not know', async () => {
    const { pi } = await (await call('example.org')).json();
    expect(pi.hostExpects).toBeNull();
    expect(pi.clientMatchesHost).toBeNull();
  });

  it('says whether the API key is configured but NEVER returns its value', async () => {
    const res = await call('va-pied.vercel.app');
    const text = await res.text();
    expect(JSON.parse(text).pi.apiKeyConfigured).toBe(true);
    expect(text).not.toContain('SECRET-KEY-VALUE-123');
  });
});
