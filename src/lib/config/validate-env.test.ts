// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { collectEnvIssues, validateEnv } from '@/lib/config/validate-env';

const silent = { warn: () => undefined, error: () => undefined };

const goodProd = {
  APP_ENV: 'production',
  DATABASE_URL: 'postgres://x',
  NEXTAUTH_SECRET: 'x'.repeat(40),
  NEXTAUTH_URL: 'https://va.pi',
  NEXT_PUBLIC_APP_URL: 'https://va.pi',
  PI_API_KEY: 'k',
  PI_SECRET_KEY: 's',
  NEXT_PUBLIC_PI_APP_ID: 'app',
  PI_MAINNET_WALLET_SEED: 'S'.padEnd(56, 'A'),
  CRON_SECRET: 'c',
  PI_PER_USD: '3.14',
};

const without = (key: string) => {
  const e: Record<string, string | undefined> = { ...goodProd };
  delete e[key];
  return e;
};

describe('validateEnv (APP_ENV=production)', () => {
  it('accepts a complete production config', () => {
    expect(() => validateEnv(goodProd, silent)).not.toThrow();
  });

  it.each([
    'PI_API_KEY',
    'PI_SECRET_KEY',
    'PI_MAINNET_WALLET_SEED',
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'CRON_SECRET',
    'PI_PER_USD',
  ])('refuses to start without %s', (key) => {
    expect(() => validateEnv(without(key), silent)).toThrow(/Invalid production configuration/);
  });

  it('refuses sandbox mode', () => {
    expect(() => validateEnv({ ...goodProd, PI_SANDBOX: 'true' }, silent)).toThrow();
    expect(() => validateEnv({ ...goodProd, NEXT_PUBLIC_PI_SANDBOX: 'true' }, silent)).toThrow();
  });

  it('refuses a testnet seed on a production deployment', () => {
    expect(() => validateEnv({ ...goodProd, PI_TESTNET_WALLET_SEED: 'S...' }, silent)).toThrow();
  });

  it('requires a conversion rate for EVERY active currency', () => {
    expect(() => validateEnv({ ...goodProd, ACTIVE_CURRENCIES: 'USD,EUR' }, silent)).toThrow(/PI_PER_EUR/);
    expect(() =>
      validateEnv({ ...goodProd, ACTIVE_CURRENCIES: 'USD,EUR', PI_PER_EUR: '3.4' }, silent)
    ).not.toThrow();
  });

  it('rejects a non-numeric or non-positive rate', () => {
    expect(() => validateEnv({ ...goodProd, PI_PER_USD: 'abc' }, silent)).toThrow();
    expect(() => validateEnv({ ...goodProd, PI_PER_USD: '0' }, silent)).toThrow();
  });

  it('rejects a weak secret and a non-https auth URL', () => {
    expect(() => validateEnv({ ...goodProd, NEXTAUTH_SECRET: 'short' }, silent)).toThrow();
    expect(() => validateEnv({ ...goodProd, NEXTAUTH_URL: 'http://va.pi' }, silent)).toThrow();
  });
});

describe('validateEnv (not production)', () => {
  it('only warns, so a Testnet deployment keeps working', () => {
    const issues = collectEnvIssues({ PI_SANDBOX: 'true' });
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.every((i) => i.level === 'warning')).toBe(true);
    expect(() => validateEnv({ PI_SANDBOX: 'true' }, silent)).not.toThrow();
  });
});
