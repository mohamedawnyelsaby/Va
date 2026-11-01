// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { isPiSandbox } from '@/lib/pi-network/sandbox';

describe('isPiSandbox', () => {
  const base = { envFlag: false, ancestorOrigins: [] as string[], referrer: '' };

  it('is false for a normal (Mainnet) load', () => {
    expect(isPiSandbox(base)).toBe(false);
    expect(isPiSandbox({ ...base, referrer: 'https://example.com/' })).toBe(false);
  });
  it('is true when the build flag is set', () => {
    expect(isPiSandbox({ ...base, envFlag: true })).toBe(true);
  });
  it('is true when opened inside the Pi sandbox frame', () => {
    expect(isPiSandbox({ ...base, ancestorOrigins: ['https://sandbox.minepi.com'] })).toBe(true);
    expect(isPiSandbox({ ...base, referrer: 'https://sandbox.minepi.com/app/va' })).toBe(true);
  });
  it('does not match look-alike hosts', () => {
    expect(isPiSandbox({ ...base, ancestorOrigins: ['https://evil.example'] })).toBe(false);
  });
});
