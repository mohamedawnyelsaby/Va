// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const m = vi.hoisted(() => ({ handler: vi.fn(), checkRateLimit: vi.fn() }));

vi.mock('next-auth', () => ({ default: () => m.handler }));
vi.mock('@/lib/auth/options', () => ({ authOptions: {} }));
vi.mock('@/lib/rate-limit', () => ({ checkRateLimit: m.checkRateLimit }));

import { GET, POST } from '@/app/api/auth/[...nextauth]/route';

const ctx = { params: Promise.resolve({ nextauth: ['callback', 'credentials'] }) };
const creds = (email: string, over: Record<string, string> = {}) =>
  new NextRequest('http://localhost/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ email, password: 'secret', ...over }).toString(),
  });

beforeEach(() => {
  vi.clearAllMocks();
  m.checkRateLimit.mockResolvedValue(null);
  m.handler.mockResolvedValue(new Response('ok'));
});

describe('NextAuth route — credentials sign-in rate limiting', () => {
  it('limits by IP and by normalised email before NextAuth sees the request', async () => {
    await POST(creds('  Victim@Example.COM '), ctx);
    const calls = m.checkRateLimit.mock.calls.map((c) => [c[1], c[2]]);
    expect(calls).toEqual([
      ['login', undefined],
      ['loginEmail', 'email:victim@example.com'],
    ]);
    expect(m.handler).toHaveBeenCalledTimes(1);
  });

  it('answers 429 and never calls NextAuth when the IP limit is hit', async () => {
    m.checkRateLimit.mockResolvedValueOnce(NextResponse.json({ error: 'slow' }, { status: 429 }));
    const res = await POST(creds('a@b.c'), ctx);
    expect(res.status).toBe(429);
    expect(m.handler).not.toHaveBeenCalled();
  });

  it('answers 429 when only the per-account limit is hit (distributed attack)', async () => {
    m.checkRateLimit
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(NextResponse.json({ error: 'slow' }, { status: 429 }));
    const res = await POST(creds('a@b.c'), ctx);
    expect(res.status).toBe(429);
    expect(m.handler).not.toHaveBeenCalled();
  });

  it('leaves the body intact for NextAuth (it is read from a clone)', async () => {
    m.handler.mockImplementation(async (req: Request) => new Response(await req.text()));
    const res = await POST(creds('keep@me.io'), ctx);
    expect(await res.text()).toContain('email=keep%40me.io');
  });

  it('reads the email from a JSON body too', async () => {
    const req = new NextRequest('http://localhost/api/auth/callback/credentials', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'JSON@x.io' }),
    });
    await POST(req, ctx);
    expect(m.checkRateLimit).toHaveBeenCalledWith(expect.anything(), 'loginEmail', 'email:json@x.io');
  });

  it('still applies the IP limit when the body is unreadable, and does not crash', async () => {
    const req = new NextRequest('http://localhost/api/auth/callback/credentials', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{not json',
    });
    const res = await POST(req, ctx);
    expect(res.status).toBe(200);
    expect(m.checkRateLimit).toHaveBeenCalledTimes(1);
    expect(m.checkRateLimit.mock.calls[0][1]).toBe('login');
  });

  it('does NOT rate-limit other NextAuth endpoints (signout, csrf, Pi, Google)', async () => {
    for (const path of ['signout', 'callback/pi-network', 'callback/google', 'session']) {
      await POST(new NextRequest(`http://localhost/api/auth/${path}`, { method: 'POST' }), ctx);
    }
    expect(m.checkRateLimit).not.toHaveBeenCalled();
    expect(m.handler).toHaveBeenCalledTimes(4);
  });

  it('GET passes straight through', async () => {
    await GET(new NextRequest('http://localhost/api/auth/session'), ctx);
    expect(m.checkRateLimit).not.toHaveBeenCalled();
    expect(m.handler).toHaveBeenCalledTimes(1);
  });
});
