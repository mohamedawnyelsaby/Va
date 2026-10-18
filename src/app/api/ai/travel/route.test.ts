// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { NextRequest } from 'next/server';

vi.hoisted(() => {
  process.env.GEMINI_API_KEY = 'test-gemini-key';
  process.env.OPENAI_API_KEY = 'test-openai-key';
  delete process.env.GEMINI_MODELS; // use the in-code defaults
});

vi.mock('@/lib/rate-limit', () => ({ checkRateLimit: vi.fn().mockResolvedValue(null) }));
vi.mock('@/lib/monitoring/sentry', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

import { POST } from '@/app/api/ai/travel/route';

const ask = () =>
  POST(
    new Request('http://localhost/api/ai/travel', {
      method: 'POST',
      body: JSON.stringify({ message: 'hello', history: [] }),
    }) as unknown as NextRequest
  );

const geminiOk = (text: string) =>
  new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }));
const openAiOk = (text: string) =>
  new Response(JSON.stringify({ choices: [{ message: { content: text } }] }));
const timeout = () => Object.assign(new Error('The operation was aborted due to timeout'), { name: 'TimeoutError' });

const urls = (f: ReturnType<typeof vi.fn>) => f.mock.calls.map((c) => String(c[0]));

let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe('POST /api/ai/travel — provider fallback', () => {
  it('uses the first Gemini model when it answers', async () => {
    fetchMock.mockResolvedValueOnce(geminiOk('{"message":"hi","action":"chat"}'));
    const body = await (await ask()).json();
    expect(body.message).toBe('hi');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(urls(fetchMock)[0]).toContain('gemini-3.8-flash');
  });

  it('a TIMEOUT on the first model falls through to the next model (used to be a 500)', async () => {
    fetchMock
      .mockRejectedValueOnce(timeout())
      .mockResolvedValueOnce(geminiOk('{"message":"from lite","action":"chat"}'));
    const res = await ask();
    expect(res.status).toBe(200);
    expect((await res.json()).message).toBe('from lite');
    expect(urls(fetchMock)[1]).toContain('gemini-3.5-flash-lite');
  });

  it('when every Gemini model times out, OpenAI answers instead of a 500', async () => {
    fetchMock
      .mockRejectedValueOnce(timeout())
      .mockRejectedValueOnce(timeout())
      .mockResolvedValueOnce(openAiOk('{"message":"from openai","action":"chat"}'));
    const res = await ask();
    expect(res.status).toBe(200);
    expect((await res.json()).message).toBe('from openai');
    expect(urls(fetchMock)[2]).toContain('api.openai.com');
  });

  it('a network error is handled the same way as a timeout', async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(geminiOk('{"message":"ok","action":"chat"}'));
    expect((await ask()).status).toBe(200);
  });

  it('a 429 and a non-JSON error body both fall through too', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('', { status: 429 }))
      .mockResolvedValueOnce(new Response('<html>bad gateway</html>', { status: 502 }))
      .mockResolvedValueOnce(openAiOk('{"message":"rescued","action":"chat"}'));
    const res = await ask();
    expect(res.status).toBe(200);
    expect((await res.json()).message).toBe('rescued');
  });

  it('when ALL providers fail the user gets a friendly 200 "busy" reply, not a 500', async () => {
    fetchMock.mockRejectedValue(timeout());
    const res = await ask();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/busy/i);
    expect(body.hotels).toEqual([]);
  });

  it('gives each Gemini call a short timeout so the fallbacks fit in the budget', async () => {
    const spy = vi.spyOn(AbortSignal, 'timeout');
    fetchMock.mockResolvedValueOnce(geminiOk('{"message":"x","action":"chat"}'));
    await ask();
    expect(spy).toHaveBeenCalledWith(8_000);
    spy.mockRestore();
  });
});
