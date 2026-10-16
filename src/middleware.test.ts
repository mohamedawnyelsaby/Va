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
