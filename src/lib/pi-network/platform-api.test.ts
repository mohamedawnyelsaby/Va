// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';

vi.mock('@/lib/logger', () => ({ logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

const SECRET = 'test-secret-key';
const sign = (ts: string, body: string) =>
  crypto.createHmac('sha256', SECRET).update(`${ts}.${body}`).digest('hex');

describe('verifyPiSignature', () => {
  const body = '{"event":"payment_completed"}';
  const ts = '1700000000000';
  let verifyPiSignature: typeof import('./platform-api').verifyPiSignature;

  beforeEach(async () => {
    vi.resetModules();
    process.env.PI_SECRET_KEY = SECRET;
    ({ verifyPiSignature } = await import('./platform-api'));
  });
  afterEach(() => {
    Reflect.deleteProperty(process.env, 'PI_SECRET_KEY');
  });

  it('accepts a valid signature', () => {
    expect(verifyPiSignature(body, sign(ts, body), ts)).toBe(true);
  });

  it('rejects a tampered body', () => {
    expect(verifyPiSignature(body + ' ', sign(ts, body), ts)).toBe(false);
  });

  it('rejects a different timestamp', () => {
    expect(verifyPiSignature(body, sign(ts, body), '1700000000001')).toBe(false);
  });

  it('rejects a signature of the wrong length', () => {
    expect(verifyPiSignature(body, sign(ts, body).slice(0, 32), ts)).toBe(false);
    expect(verifyPiSignature(body, sign(ts, body) + 'aa', ts)).toBe(false);
  });

  it('rejects non-hex signatures', () => {
    expect(verifyPiSignature(body, 'z'.repeat(64), ts)).toBe(false);
  });

  it('rejects missing body, signature or timestamp', () => {
    expect(verifyPiSignature('', sign(ts, body), ts)).toBe(false);
    expect(verifyPiSignature(body, '', ts)).toBe(false);
    expect(verifyPiSignature(body, sign(ts, body), '')).toBe(false);
  });

  it('fails closed when the secret is not configured', async () => {
    Reflect.deleteProperty(process.env, 'PI_SECRET_KEY');
    expect(verifyPiSignature(body, sign(ts, body), ts)).toBe(false);
  });
});
