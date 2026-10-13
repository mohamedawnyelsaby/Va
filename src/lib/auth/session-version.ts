// src/lib/auth/session-version.ts
//
// A short fingerprint of the credentials a session was issued against.
// It is stored in the JWT at sign-in and re-derived from the database on every
// later token read (see the `jwt` callback in options.ts). When the password
// changes (reset-password, or Google's "pre-hijack" cleanup that nulls it),
// the fingerprint changes and every older session stops working.
//
// Accounts without a password (Pi / Google) all map to the same value, so they
// are only revoked through `isActive`.
//
// Only a truncated SHA-256 of the bcrypt hash is kept in the JWT, never the
// hash itself.

import crypto from 'crypto';

export function sessionVersion(passwordHash: string | null | undefined): string {
  return crypto
    .createHash('sha256')
    .update(passwordHash ?? '')
    .digest('hex')
    .slice(0, 16);
}
