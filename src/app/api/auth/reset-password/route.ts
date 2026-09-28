// src/app/api/auth/reset-password/route.ts
// Redeems the token issued by POST /api/auth/forgot-password.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const bodySchema = z.object({
  email: z.string().email(),
  token: z.string().min(20).max(200),
  password: passwordSchema,
});

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(request: NextRequest) {
  const limited = await checkRateLimit(request, 'auth');
  if (limited) {return limited;}

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    const email = normalizeEmail(body.email);
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, resetTokenHash: true, resetTokenExpiry: true, isActive: true },
    });

    const invalid = () =>
      NextResponse.json({ error: 'This reset link is invalid or has expired.' }, { status: 400 });

    if (!user || !user.isActive || !user.resetTokenHash || !user.resetTokenExpiry) {
      return invalid();
    }
    if (user.resetTokenExpiry.getTime() < Date.now()) {
      return invalid();
    }

    const providedHash = hashToken(body.token);
    const storedHash = Buffer.from(user.resetTokenHash);
    const provided = Buffer.from(providedHash);
    const matches =
      storedHash.length === provided.length && crypto.timingSafeEqual(storedHash, provided);
    if (!matches) {
      return invalid();
    }

    const newHash = await bcrypt.hash(body.password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: newHash,
        // Single-use: clear immediately so the link can't be replayed.
        resetTokenHash: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ success: true, message: 'Password updated. You can now sign in.' });
  } catch (error) {
    logger.error('[reset-password] error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
