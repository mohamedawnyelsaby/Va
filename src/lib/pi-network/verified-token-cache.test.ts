// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  clearVerifiedTokens,
  getVerifiedToken,
  rememberVerifiedToken,
} from '@/lib/pi-network/verified-token-cache';

beforeEach(() => clearVerifiedTokens());
afterEach(() => vi.useRealTimers());

describe('verified token cache', () => {
  it('returns a verified token for the same uid', () => {
    rememberVerifiedToken('tok', 'uid1', 'alice');
    expect(getVerifiedToken('tok', 'uid1')).toEqual({ uid: 'uid1', username: 'alice' });
  });

  it('never returns a hit for a different uid (no impersonation)', () => {
    rememberVerifiedToken('tok', 'uid1', 'alice');
    expect(getVerifiedToken('tok', 'someone-else')).toBeNull();
  });

  it('never returns a hit for an unknown token', () => {
    rememberVerifiedToken('tok', 'uid1', 'alice');
    expect(getVerifiedToken('other', 'uid1')).toBeNull();
    expect(getVerifiedToken('', 'uid1')).toBeNull();
  });

  it('expires after 5 minutes', () => {
    vi.useFakeTimers();
    rememberVerifiedToken('tok', 'uid1', 'alice');
    vi.advanceTimersByTime(5 * 60 * 1000 + 1);
    expect(getVerifiedToken('tok', 'uid1')).toBeNull();
  });
});
