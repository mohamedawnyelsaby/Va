// src/lib/auth/guards.ts
// Authorization helpers for API routes.
//
// Usage:
//   const guard = await requireAdmin();
//   if ('response' in guard) { return guard.response; }
//   const { userId } = guard;
//
// The role is ALWAYS re-read from the database (never trusted from the JWT),
// so demoting / deactivating a user takes effect immediately.
//
// To make someone an admin (run once, manually):
//   UPDATE "User" SET role = 'admin' WHERE email = 'you@example.com';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db';

export type GuardResult = { userId: string } | { response: NextResponse };

export async function requireUser(): Promise<GuardResult> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { userId };
}

export async function requireAdmin(): Promise<GuardResult> {
  const guard = await requireUser();
  if ('response' in guard) {return guard;}

  const user = await prisma.user.findUnique({
    where: { id: guard.userId },
    select: { role: true, isActive: true },
  });

  if (!user || !user.isActive || user.role !== 'admin') {
    return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return guard;
}
