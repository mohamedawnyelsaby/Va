// ============================================
// PI AUTHENTICATION & BALANCE ENDPOINTS
// Production-ready, secure, Pi-only
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPiUser } from '@/lib/pi-network/platform-api';

/**
 * POST /api/pi/auth
 * Authenticate user with Pi Network
 */
export async function POST(request: NextRequest) {
  try {
    const { accessToken, uid } = await request.json();

    if (!accessToken || !uid) {
      return NextResponse.json(
        { error: 'Missing credentials' },
        { status: 400 }
      );
    }

    // Verify user with Pi Network
    const piUser = await verifyPiUser(accessToken);

    if (piUser.uid !== uid) {
      return NextResponse.json(
        { error: 'User verification failed' },
        { status: 401 }
      );
    }

    // Find or create user in DB
    let user = await prisma.user.findFirst({
      where: { piWalletId: uid },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: `${piUser.username}@pi.network`,
          name: piUser.username,
          piWalletId: uid,
          piUsername: piUser.username,
          piAccessToken: accessToken,
          emailVerified: new Date(),
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          piAccessToken: accessToken,
          piUsername: piUser.username,
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        piUsername: user.piUsername,
        piBalance: user.piBalance,
      },
    });
  } catch (error) {
    console.error('Pi auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pi/auth
 * Get Pi balance and username
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        piBalance: true,
        piUsername: true,
        _count: {
          select: {
            payments: {
              where: {
                status: 'completed',
                currency: 'PI',
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      balance: user.piBalance,
      username: user.piUsername,
      totalTransactions: user._count.payments,
    });
  } catch (error) {
    console.error('Pi balance error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balance', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
