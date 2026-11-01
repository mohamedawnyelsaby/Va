// src/lib/pi-network/verified-token-cache.ts
//
// Remembers, for a few minutes, that a Pi access token was ALREADY verified
// against Pi's API (/v2/me) for a given uid. One sign-in verifies the same
// token in several places (/api/auth/pi/verify, then the NextAuth
// 'pi-network' provider). Asking Pi again every time is slow and made the
// final step fail when Pi's API was slow or rate limited.
//
// Safety: an entry only exists after a real successful verification of that
// exact token, the uid must match what the entry was stored with, entries
// expire after 5 minutes, and only a SHA-256 hash of the token is kept in
// memory (never the token itself). The cache is per server instance; a miss
// simply falls back to a normal verification against Pi.

import crypto from 'crypto';

const TTL_MS = 5 * 60 * 1000;
const MAX_ENTRIES = 1000;

interface Entry {
  uid: string;
  username: string;
  timestamp: number;
}

const cache = new Map<string, Entry>();

const keyOf = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

function prune(now: number) {
  for (const [k, v] of cache) {
    if (now - v.timestamp > TTL_MS) {cache.delete(k);}
  }
  // Hard cap: drop the oldest entries first.
  while (cache.size > MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) {break;}
    cache.delete(oldest);
  }
}

export function getVerifiedToken(token: string, uid: string): { uid: string; username: string } | null {
  if (!token || !uid) {return null;}
  const hit = cache.get(keyOf(token));
  if (!hit) {return null;}
  if (Date.now() - hit.timestamp > TTL_MS || hit.uid !== uid) {
    cache.delete(keyOf(token));
    return null;
  }
  return { uid: hit.uid, username: hit.username };
}

export function rememberVerifiedToken(token: string, uid: string, username: string): void {
  if (!token || !uid) {return;}
  const now = Date.now();
  cache.set(keyOf(token), { uid, username, timestamp: now });
  prune(now);
}

export function clearVerifiedTokens(): void {
  cache.clear();
}
