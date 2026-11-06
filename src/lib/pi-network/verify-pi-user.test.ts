// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/logger', () => ({ logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

const axiosMock = vi.hoisted(() => {
  const fn = vi.fn() as ReturnType<typeof vi.fn> & { isAxiosError: (e: unknown) => boolean };
  fn.isAxiosError = (e: unknown) => Boolean((e as { isAxiosError?: boolean })?.isAxiosError);
  return fn;
});
vi.mock('axios', () => ({ default: axiosMock }));

import { verifyPiUser } from './platform-api';

const httpError = (status: number) => ({ isAxiosError: true, response: { status, statusText: 'x', data: {} }, request: {} });
const networkError = () => ({ isAxiosError: true, request: {} });

// verifyPiUser may sleep between its (single) retry: drive timers manually.
async function run(promise: Promise<unknown>) {
  const settled = promise.then(
    (v) => ({ ok: true as const, v }),
    (e: Error) => ({ ok: false as const, e })
  );
  await vi.runAllTimersAsync();
  return settled;
}

beforeEach(() => {
  vi.useFakeTimers();
  axiosMock.mockReset();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('verifyPiUser error classification', () => {
  it('returns the user when Pi answers', async () => {
    axiosMock.mockResolvedValue({ data: { uid: 'pi_1', username: 'alice' } });
    const r = await run(verifyPiUser('tok'));
    expect(r).toMatchObject({ ok: true, v: { uid: 'pi_1' } });
  });

  it('maps a Pi 401 to "Invalid Pi access token" without retrying', async () => {
    axiosMock.mockRejectedValue(httpError(401));
    const r = await run(verifyPiUser('tok'));
    expect(r.ok).toBe(false);
    expect(!r.ok && r.e.message).toBe('Invalid Pi access token');
    expect(axiosMock).toHaveBeenCalledTimes(1);
  });

  it('maps a Pi 5xx to "Pi service unavailable" after exactly two retries', async () => {
    axiosMock.mockRejectedValue(httpError(503));
    const r = await run(verifyPiUser('tok'));
    expect(!r.ok && r.e.message).toBe('Pi service unavailable');
    expect(axiosMock).toHaveBeenCalledTimes(3);
  });

  it('maps a network failure / timeout to "Pi service unavailable"', async () => {
    axiosMock.mockRejectedValue(networkError());
    const r = await run(verifyPiUser('tok'));
    expect(!r.ok && r.e.message).toBe('Pi service unavailable');
  });

  it('uses a short timeout on /v2/me (3 s) so one stalled call costs seconds, not ~47 s', async () => {
    axiosMock.mockResolvedValue({ data: { uid: 'pi_1', username: 'a' } });
    await run(verifyPiUser('tok'));
    expect(axiosMock.mock.calls[0][0].timeout).toBe(3000);
  });

  it('recovers when the first call stalls and a retry answers (the production failure mode)', async () => {
    axiosMock
      .mockRejectedValueOnce(networkError())
      .mockResolvedValueOnce({ data: { uid: 'pi_1', username: 'a' } });
    const r = await run(verifyPiUser('tok'));
    expect(r).toMatchObject({ ok: true, v: { uid: 'pi_1' } });
    expect(axiosMock).toHaveBeenCalledTimes(2);
  });

  it('treats a response without a uid as a generic failure', async () => {
    axiosMock.mockResolvedValue({ data: {} });
    const r = await run(verifyPiUser('tok'));
    expect(!r.ok && r.e.message).toBe('Failed to verify Pi user token');
  });

  it('rejects an empty token without calling Pi', async () => {
    const r = await run(verifyPiUser('   '));
    expect(!r.ok && r.e.message).toBe('Failed to verify Pi user token');
    expect(axiosMock).not.toHaveBeenCalled();
  });
});
