import { describe, it, expect } from 'vitest';
import { sessionVersion } from '@/lib/auth/session-version';

describe('sessionVersion', () => {
  it('is stable for the same password hash', () => {
    expect(sessionVersion('$2a$12$abc')).toBe(sessionVersion('$2a$12$abc'));
  });

  it('changes when the password hash changes (revokes old sessions)', () => {
    expect(sessionVersion('$2a$12$old')).not.toBe(sessionVersion('$2a$12$new'));
  });

  it('treats null / undefined / empty as the same passwordless account', () => {
    expect(sessionVersion(null)).toBe(sessionVersion(undefined));
    expect(sessionVersion(null)).toBe(sessionVersion(''));
  });

  it('a password being set or removed changes the version', () => {
    expect(sessionVersion(null)).not.toBe(sessionVersion('$2a$12$abc'));
  });

  it('never exposes the hash itself', () => {
    const v = sessionVersion('$2a$12$supersecrethash');
    expect(v).toHaveLength(16);
    expect(v).toMatch(/^[0-9a-f]{16}$/);
    expect(v).not.toContain('supersecret');
  });
});
