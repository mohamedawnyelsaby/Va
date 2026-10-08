import { describe, it, expect, afterEach, vi } from 'vitest';
import { getA2UNetworkConfig, sendA2UPayment } from '@/lib/pi-network/a2u';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('a2u network selection', () => {
  it('uses testnet + its own seed variable when PI_SANDBOX is true', () => {
    vi.stubEnv('PI_SANDBOX', 'true');
    const cfg = getA2UNetworkConfig();
    expect(cfg.network).toBe('testnet');
    expect(cfg.passphrase).toBe('Pi Testnet');
    expect(cfg.horizonUrl).toBe('https://api.testnet.minepi.com');
    expect(cfg.seedEnvName).toBe('PI_TESTNET_WALLET_SEED');
  });

  it('uses mainnet + its own, different seed variable otherwise', () => {
    vi.stubEnv('PI_SANDBOX', 'false');
    const cfg = getA2UNetworkConfig();
    expect(cfg.network).toBe('mainnet');
    expect(cfg.passphrase).toBe('Pi Network');
    expect(cfg.horizonUrl).toBe('https://api.mainnet.minepi.com');
    expect(cfg.seedEnvName).toBe('PI_MAINNET_WALLET_SEED');
  });
});

describe('a2u refuses to run when misconfigured (before any network call)', () => {
  const params = { uid: 'some-uid', amount: 0.01, memo: 'test' };

  it('refuses without PI_API_KEY', async () => {
    vi.stubEnv('PI_SANDBOX', 'true');
    vi.stubEnv('PI_API_KEY', '');
    await expect(sendA2UPayment(params)).rejects.toThrow('PI_API_KEY');
  });

  it('refuses on testnet when the testnet seed is missing', async () => {
    vi.stubEnv('PI_SANDBOX', 'true');
    vi.stubEnv('PI_API_KEY', 'key');
    vi.stubEnv('PI_TESTNET_WALLET_SEED', '');
    await expect(sendA2UPayment(params)).rejects.toThrow('PI_TESTNET_WALLET_SEED');
  });

  it('on mainnet ignores the testnet seed entirely and refuses', async () => {
    vi.stubEnv('PI_SANDBOX', 'false');
    vi.stubEnv('PI_API_KEY', 'key');
    vi.stubEnv('PI_TESTNET_WALLET_SEED', 'SABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUV');
    vi.stubEnv('PI_MAINNET_WALLET_SEED', '');
    await expect(sendA2UPayment(params)).rejects.toThrow('PI_MAINNET_WALLET_SEED');
  });

  it('never echoes a bad seed value in its error', async () => {
    const badSeed = 'S-this-is-not-a-real-seed-and-must-not-leak';
    vi.stubEnv('PI_SANDBOX', 'true');
    vi.stubEnv('PI_API_KEY', 'key');
    vi.stubEnv('PI_TESTNET_WALLET_SEED', badSeed);
    const err = await sendA2UPayment(params).catch((e: Error) => e);
    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).not.toContain(badSeed);
    expect((err as Error).message).toContain('not a valid secret seed');
  });

  it('rejects nonsense amounts', async () => {
    vi.stubEnv('PI_SANDBOX', 'true');
    vi.stubEnv('PI_API_KEY', 'key');
    vi.stubEnv('PI_TESTNET_WALLET_SEED', 'x');
    await expect(sendA2UPayment({ ...params, amount: -5 })).rejects.toThrow('Invalid amount');
    await expect(sendA2UPayment({ ...params, amount: Number.NaN })).rejects.toThrow('Invalid amount');
  });
});
