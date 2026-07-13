// src/app/api/pi/auth/route.ts
// SECURITY FIX (2026-07-13): previously, if verifyPiUser() failed for any
// reason (including a transient network error), the code logged a warning
// and kept going — creating/updating a user account using the client-
// supplied `uid` with no real confirmation from Pi Network. Anyone could
// send someone else's uid with any accessToken and, if the verification
// call happened to fail, get authenticated as that user.
// Now: any verification failure rejects the request outright.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPiUser } from '@/lib/pi-network/platform-api';

export async function POST(request: NextRequest) {
  try {
    const { accessToken, uid } = await request.json();
    if (!accessToken || !uid) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    let piUsername: string;
    try {
      const piUser = await verifyPiUser(accessToken);
      if (piUser.uid !== uid) {
        return NextResponse.json({ error: 'User verification failed' }, { status: 401 });
      }
      piUsername = piUser.username;
    } catch (e) {
      // ✅ FIX: no more silent "trust the client-supplied uid" fallback.
      // If we can't confirm identity with Pi Network, we don't authenticate.
      console.error('Pi API verify failed — rejecting request:', e instanceof Error ? e.message : e);
      return NextResponse.json(
        { error: 'Could not verify identity with Pi Network. Please try again.' },
        { status: 503 }
      );
    }

    let user = await prisma.user.findFirst({ where: { piWalletId: uid } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: `${piUsername}@pi.network`,
          name: piUsername,
          piWalletId: uid,
          piUsername: piUsername,
          piAccessToken: accessToken,
          emailVerified: new Date(),
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { piAccessToken: accessToken, piUsername: piUsername },
      });
    }

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, piUsername: user.piUsername, piBalance: user.piBalance },
    });
  } catch (error) {
    console.error('Pi auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
