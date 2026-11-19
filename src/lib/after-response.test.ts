import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), log: vi.fn(), info: vi.fn() },
}));

import { runAfterResponse } from './after-response';

describe('runAfterResponse', () => {
  it('still runs the task when called outside a request scope', async () => {
    const task = vi.fn().mockResolvedValue(undefined);
    runAfterResponse('test', task);
    await Promise.resolve();
    expect(task).toHaveBeenCalledTimes(1);
  });

  it('never throws to the caller when the task fails', async () => {
    const task = vi.fn().mockRejectedValue(new Error('smtp down'));
    expect(() => runAfterResponse('test', task)).not.toThrow();
    await Promise.resolve();
    expect(task).toHaveBeenCalledTimes(1);
  });
});
