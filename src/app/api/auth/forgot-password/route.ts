// src/app/api/auth/forgot-password/route.ts
//
// Real password-reset request. Before this endpoint existed, the
// forgot-password page just did `setTimeout(1200)` and showed "email sent"
// — no email was ever sent and there was no way to actually recover an
// account.
//
// SECURITY
// - Response is identical (and takes ~the same time) whether or not the
//   email exists, an OAuth/Pi-only account, or an inactive account — the
//   endpoint never reveals which by its response.
// - Only a SHA-256 hash of the token is stored; the raw token exists only
//   in the emailed link. A token is single-use (cleared on redemption) and
//   expires after 1 hour.
// - Requesting again immediately invalidates any previous unused token for
//   that account (old links stop working).

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';
import { sendPasswordResetEmail } from '@/lib/email/notifications';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

const bodySchema = z.object({ email: z.string().email() });

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(request: NextRequest) {
  const limited = await checkRateLimit(request, 'auth');
  if (limited) {return limited;}

  // Constant shape response regardless of what happens below.
  const genericResponse = () =>
    NextResponse.json({
      success: true,
      message: 'If an account exists for that email, a reset link has been sent.',
    });

  let email: string;
  try {
    ({ email } = bodySchema.parse(await request.json()));
  } catch {
    // Still generic: don't confirm/deny email format issues reveal anything
    // meaningful, but this one really is a bad request.
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    const normalized = normalizeEmail(email);
    const user = await prisma.user.findUnique({
      where: { email: normalized },
      select: { id: true, name: true, email: true, password: true, isActive: true },
    });

    // No account, OAuth/Pi-only account (no password to reset), or
    // deactivated account: pretend it worked, send nothing.
    if (!user || !user.password || !user.isActive) {
      return genericResponse();
    }

    const rawToken = crypto.randomBytes(32).toString('base64url');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash: hashToken(rawToken),
        resetTokenExpiry: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || '';
    const resetUrl = `${baseUrl}/auth/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

    // Fire-and-forget: email delivery failure shouldn't leak into the
    // response (sendEmail already logs failures internally).
    sendPasswordResetEmail(user.email, user.name || 'there', resetUrl).catch((err) => {
      logger.error('[forgot-password] email send failed:', err);
    });

    return genericResponse();
  } catch (error) {
    logger.error('[forgot-password] error:', error);
    // Even on an unexpected error, don't reveal internals — but this one
    // really did fail, so it's not the generic success response.
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
