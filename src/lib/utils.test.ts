// @vitest-environment node
import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatCurrency, formatPi, toPiDisplay } from '@/lib/utils';

afterEach(() => vi.unstubAllEnvs());

describe('price display is always Pi', () => {
  it('converts with the configured PI_PER_<CUR> rates and never shows a fiat symbol', () => {
    vi.stubEnv('NEXT_PUBLIC_PI_RATES', JSON.stringify({ USD: 3, EUR: 3.4 }));
    expect(formatCurrency(264, 'USD')).toBe('π 792');
    expect(formatCurrency(10, 'EUR')).toBe('π 34');
    expect(formatCurrency(176, 'USD')).not.toMatch(/[$€£]/);
  });

  it('passes Pi amounts through unchanged', () => {
    expect(formatCurrency(12.5, 'PI')).toBe('π 12.5');
    expect(toPiDisplay(7, 'pi')).toBe(7);
  });

  it('rounds the displayed Pi to at most 2 decimals', () => {
    vi.stubEnv('NEXT_PUBLIC_PI_RATES', JSON.stringify({ USD: 3.1416 }));
    expect(formatCurrency(1, 'USD')).toBe('π 3.14');
    expect(formatPi(0)).toBe('π 0');
  });

  it('production with an unknown rate shows no price instead of a wrong one', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_PI_RATES', JSON.stringify({ USD: 3 }));
    expect(formatCurrency(100, 'JPY')).toBe('π —');
  });

  it('development falls back to 1:1 like the server does', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_PI_RATES', '');
    expect(formatCurrency(5, 'USD')).toBe('π 5');
  });

  it('ignores a malformed or invalid rate table', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_PI_RATES', '{not json');
    expect(formatCurrency(5, 'USD')).toBe('π —');
    vi.stubEnv('NEXT_PUBLIC_PI_RATES', JSON.stringify({ USD: -1, EUR: 'x' }));
    expect(formatCurrency(5, 'USD')).toBe('π —');
  });
});
