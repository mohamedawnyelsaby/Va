// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

const visit = (path: string, headers: Record<string, string> = {}) =>
  middleware(new NextRequest(`http://localhost${path}`, { headers }));
const target = (res: Response) => new URL(res.headers.get('location') ?? '', 'http://localhost').pathname;

describe('middleware locale detection', () => {
  it.each([
    ['fr-FR,fr;q=0.9', '/fr/hotels'],
    ['ar-EG,ar;q=0.9', '/ar/hotels'],
    ['ja,en;q=0.5', '/ja/hotels'],
  ])('redirects "%s" to a supported locale', async (lang, expected) => {
    expect(target(await visit('/hotels', { 'accept-language': lang }))).toBe(expected);
  });

  it.each(['it-IT,it;q=0.9', 'ko-KR,ko;q=0.9'])(
    'sends unsupported "%s" to English instead of a 404-ing /it or /ko',
    async (lang) => {
      expect(target(await visit('/hotels', { 'accept-language': lang }))).toBe('/en/hotels');
    }
  );

  it('ignores an NEXT_LOCALE cookie that names an unsupported locale', async () => {
    expect(target(await visit('/hotels', { cookie: 'NEXT_LOCALE=ko' }))).toBe('/en/hotels');
  });

  it('honours a valid NEXT_LOCALE cookie', async () => {
    expect(target(await visit('/hotels', { cookie: 'NEXT_LOCALE=de' }))).toBe('/de/hotels');
  });

  it('does not redirect a path that already has a supported locale', async () => {
    const res = await visit('/ar/hotels');
    expect(res.headers.get('location')).toBeNull();
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });
});

describe('middleware API protection', () => {
  const api = (path: string, init: { method?: string; headers?: Record<string, string> } = {}) =>
    middleware(new NextRequest(`http://localhost${path}`, init));

  it('rejects an unknown Origin with 403', async () => {
    const res = await api('/api/hotels', { headers: { origin: 'https://evil.example' } });
    expect(res.status).toBe(403);
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('rejects a preflight from an unknown Origin', async () => {
    const res = await api('/api/bookings', { method: 'OPTIONS', headers: { origin: 'https://evil.example' } });
    expect(res.status).toBe(403);
  });

  it('answers a preflight from the app itself and echoes only that origin', async () => {
    const res = await api('/api/hotels', { method: 'OPTIONS', headers: { origin: 'http://localhost' } });
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe('http://localhost');
  });

  it.each(['/api/bookings', '/api/payments/pi/create', '/api/user', '/api/favorites'])(
    'returns 401 for %s without a session',
    async (path) => {
      const res = await api(path, { method: 'POST' });
      expect(res.status).toBe(401);
    }
  );

  it('does not let a dotted path skip the API checks', async () => {
    const res = await api('/api/bookings/a.b', { method: 'POST' });
    expect(res.status).toBe(401);
  });

  it('keeps public reads and the signed webhook reachable without a session', async () => {
    expect((await api('/api/hotels')).status).toBe(200);
    expect((await api('/api/health')).status).toBe(200);
    expect((await api('/api/webhooks/pi', { method: 'POST' })).status).toBe(200);
  });

  it('redirects a sensitive page to sign-in when there is no session', async () => {
    const res = await visit('/en/wallet');
    expect(res.status).toBe(307);
    expect(target(res)).toBe('/en/auth/signin');
    expect(res.headers.get('location')).toContain('callbackUrl=%2Fen%2Fwallet');
  });
});
