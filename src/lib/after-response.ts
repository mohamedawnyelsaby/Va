// src/lib/after-response.ts
//
// Runs follow-up work (sending an email, say) AFTER the HTTP response has been
// sent, while telling the platform to keep the function alive until it is done.
//
// Why not a bare un-awaited promise: on Vercel the function can be frozen the
// moment the response is returned, so a "fire-and-forget" email may never go out.
// Why not `await`: for forgot-password that would make the response slower when
// the account exists, which lets an attacker tell registered emails apart.
//
// Failures are logged and never reach the caller. Outside a request scope
// (unit tests, scripts) `after()` throws, so the task just runs directly.

import { after } from 'next/server';
import { logger } from '@/lib/logger';

export function runAfterResponse(label: string, task: () => Promise<unknown>): void {
  const safe = async (): Promise<void> => {
    try {
      await task();
    } catch (err) {
      logger.error(`[${label}] background task failed:`, err);
    }
  };
  try {
    after(safe);
  } catch {
    void safe();
  }
}
