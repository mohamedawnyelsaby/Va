// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  classifyApi,
  getAllowedOrigins,
  isOriginAllowed,
  isProtectedPage,
} from '@/lib/security/api-policy';

describe('CORS allowlist', () => {
  const own = 'https://va.example';
  const allowed = getAllowedOrigins({ CORS_ALLOWED_ORIGINS: 'https://va.pi, https://partner.example' });

  it('allows the app itself, Pi origins and explicitly configured origins', () => {
    expect(isOriginAllowed(own, own, allowed)).toBe(true);
    expect(isOriginAllowed('https://sdk.minepi.com', own, allowed)).toBe(true);
    expect(isOriginAllowed('https://va.pi', own, allowed)).toBe(true);
  });

  it('rejects unknown origins', () => {
    expect(isOriginAllowed('https://evil.example', own, allowed)).toBe(false);
    expect(isOriginAllowed('https://va.pi.evil.example', own, allowed)).toBe(false);
    expect(isOriginAllowed('null', own, allowed)).toBe(false);
    expect(isOriginAllowed('', own, allowed)).toBe(false);
  });

  it('never treats a wildcard in the env list as "allow all"', () => {
    const list = getAllowedOrigins({ CORS_ALLOWED_ORIGINS: '*' });
    expect(isOriginAllowed('https://evil.example', own, list)).toBe(false);
  });
});

describe('API access classification (deny by default)', () => {
  it.each([
    ['/api/bookings', 'GET'],
    ['/api/bookings', 'POST'],
    ['/api/payments/pi/create', 'POST'],
    ['/api/payments/pi/approve', 'POST'],
    ['/api/user', 'GET'],
    ['/api/favorites', 'GET'],
    ['/api/dev/a2u-test', 'POST'],
    ['/api/hotels', 'POST'],
    ['/api/hotels/abc', 'DELETE'],
    ['/api/reviews', 'POST'],
    ['/api/something-new', 'GET'],
  ])('%s %s requires a session', (path, method) => {
    expect(classifyApi(path, method)).toBe('protected');
  });

  it.each([
    ['/api/hotels', 'GET'],
    ['/api/hotels/abc', 'GET'],
    ['/api/search', 'GET'],
    ['/api/reviews', 'GET'],
    ['/api/health', 'GET'],
    ['/api/auth/signin', 'POST'],
    ['/api/pi/auth', 'POST'],
    ['/api/ai/travel', 'POST'],
  ])('%s %s is explicitly public', (path, method) => {
    expect(classifyApi(path, method)).toBe('public');
  });

  it.each(['/api/webhooks/pi', '/api/cron/reconcile-payments', '/api/seed'])(
    '%s authenticates itself',
    (path) => {
      expect(classifyApi(path, 'POST')).toBe('self-authenticated');
    }
  );

  it('does not let a look-alike prefix inherit public access', () => {
    expect(classifyApi('/api/hotelsfoo', 'GET')).toBe('protected');
    expect(classifyApi('/api/authx', 'GET')).toBe('protected');
  });
});

describe('protected pages', () => {
  it.each(['/wallet', '/profile', '/bookings', '/booking/success', '/dashboard', '/favorites', '/settings'])(
    '%s requires sign-in',
    (p) => expect(isProtectedPage(p)).toBe(true)
  );
  it.each(['/', '/hotels', '/hotels/1', '/auth/signin', '/about', '/search'])('%s is public', (p) =>
    expect(isProtectedPage(p)).toBe(false)
  );
});
