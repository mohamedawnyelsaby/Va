// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { checkRateLimit, getClientId } from '@/lib/rate-limit';

const req = (headers: Record<string, string> = {}) =>
  new Request('http://localhost/api/x', { method: 'POST', headers });

describe('getClientId', () => {
  it('prefers platform-set headers over a spoofable x-forwarded-for', () => {
    expect(
      getClientId(req({ 'x-vercel-forwarded-for': '1.1.1.1', 'x-forwarded-for': '6.6.6.6' }))
    ).toBe('1.1.1.1');
    expect(getClientId(req({ 'x-real-ip': '2.2.2.2', 'x-forwarded-for': '6.6.6.6' }))).toBe(
      '2.2.2.2'
    );
  });

  it('falls back to the first x-forwarded-for entry, then "unknown"', () => {
    expect(getClientId(req({ 'x-forwarded-for': '3.3.3.3, 10.0.0.1' }))).toBe('3.3.3.3');
    expect(getClientId(req())).toBe('unknown');
  });
});

describe('checkRateLimit (in-memory fallback)', () => {
  it('allows up to the limit, then answers 429 with Retry-After', async () => {
    const r = req({ 'x-real-ip': '9.9.9.1' });
    for (let i = 0; i < 10; i++) {
      expect(await checkRateLimit(r, 'login')).toBeNull();
    }
    const blocked = await checkRateLimit(r, 'login');
    expect(blocked?.status).toBe(429);
    expect(Number(blocked?.headers.get('Retry-After'))).toBeGreaterThan(0);
  });

  it('limits per custom key, independent of the IP (distributed attack on one account)', async () => {
    const key = 'email:victim-a@example.com';
    for (let i = 0; i < 10; i++) {
      // every request from a different IP
      expect(await checkRateLimit(req({ 'x-real-ip': `7.7.7.${i}` }), 'loginEmail', key)).toBeNull();
    }
    const blocked = await checkRateLimit(req({ 'x-real-ip': '7.7.7.200' }), 'loginEmail', key);
    expect(blocked?.status).toBe(429);
  });

  it('does not let one account\'s attempts block another account', async () => {
    for (let i = 0; i < 10; i++) {
      await checkRateLimit(req(), 'loginEmail', 'email:b@example.com');
    }
    expect(await checkRateLimit(req(), 'loginEmail', 'email:c@example.com')).toBeNull();
  });
});
