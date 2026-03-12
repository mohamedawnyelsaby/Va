import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPiUser } from '@/lib/pi-network/platform-api';

export async function POST(request: NextRequest) {
  try {
    const { accessToken, uid } = await request.json();
    if (!accessToken || !uid) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    let piUsername = uid;
    try {
      const piUser = await verifyPiUser(accessToken);
      if (piUser.uid !== uid) {
        return NextResponse.json({ error: 'User verification failed' }, { status: 401 });
      }
      piUsername = piUser.username;
    } catch (e) {
      console.log('Pi API verify failed, trusting SDK auth');
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
