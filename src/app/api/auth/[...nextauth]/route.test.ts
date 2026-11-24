// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const m = vi.hoisted(() => ({ handler: vi.fn() }));

vi.mock('next-auth', () => ({ default: () => m.handler }));
vi.mock('@/lib/auth/options', () => ({ authOptions: {} }));

import { GET, POST } from '@/app/api/auth/[...nextauth]/route';

const ctx = { params: Promise.resolve({ nextauth: ['callback', 'pi-network'] }) };

beforeEach(() => {
  vi.clearAllMocks();
  m.handler.mockResolvedValue(new Response('ok'));
});

describe('NextAuth route', () => {
  it('POST passes straight through to NextAuth (Pi sign-in, signout, csrf)', async () => {
    for (const path of ['signout', 'callback/pi-network', 'session']) {
      await POST(new NextRequest(`http://localhost/api/auth/${path}`, { method: 'POST' }), ctx);
    }
    expect(m.handler).toHaveBeenCalledTimes(3);
  });

  it('leaves the request body intact for NextAuth', async () => {
    m.handler.mockImplementation(async (req: Request) => new Response(await req.text()));
    const req = new NextRequest('http://localhost/api/auth/callback/pi-network', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'uid=p1',
    });
    const res = await POST(req, ctx);
    expect(await res.text()).toContain('uid=p1');
  });

  it('GET passes straight through', async () => {
    await GET(new NextRequest('http://localhost/api/auth/session'), ctx);
    expect(m.handler).toHaveBeenCalledTimes(1);
  });
});
