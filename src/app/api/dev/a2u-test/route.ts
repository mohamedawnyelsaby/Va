// src/app/api/dev/a2u-test/route.ts
//
// TESTNET-ONLY. Lets a signed-in Pi user ask the app to send a tiny test
// payment (A2U) to THEIR OWN Pi wallet. Pi requires a Testnet app to have
// completed A2U transactions to 5 unique wallets before it will grant a
// Mainnet app wallet; having 5 different testers each press the button once
// satisfies that without anyone typing wallet ids by hand.
//
// Hard guards:
// - 404 unless this deployment is a testnet one (PI_SANDBOX === 'true'),
//   so on a mainnet deployment this route effectively doesn't exist.
// - Recipient is always the caller's own Pi uid — it can't be pointed at
//   anyone else.
// - Fixed small amount; the caller cannot choose it.
// - Rate limited, and A2U itself runs strictly one-at-a-time.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth/guards';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { getA2UNetworkConfig, sendA2UPayment } from '@/lib/pi-network/a2u';

const TEST_AMOUNT = 0.01;

export async function POST(request: NextRequest) {
  if (getA2UNetworkConfig().network !== 'testnet') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const limited = await checkRateLimit(request, 'payment');
  if (limited) {return limited;}

  const guard = await requireUser();
  if ('response' in guard) {return guard.response;}

  try {
    const user = await prisma.user.findUnique({
      where: { id: guard.userId },
      select: { piWalletId: true, piUsername: true },
    });
    if (!user?.piWalletId) {
      return NextResponse.json(
        { error: 'Sign in with Pi Network first — this test sends Pi to your Pi account.' },
        { status: 400 }
      );
    }

    const result = await sendA2UPayment({
      uid: user.piWalletId,
      amount: TEST_AMOUNT,
      memo: 'Va Travel testnet A2U test',
      metadata: { purpose: 'a2u-listing-test' },
    });

    return NextResponse.json({ success: true, ...result, amount: TEST_AMOUNT });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'A2U test failed';
    logger.error('[a2u-test] failed:', message);
    // This is a testnet-only diagnostic route, so surfacing the reason is
    // useful (it's what lets us debug without DevTools on a phone). It never
    // contains the seed — a2u.ts never puts it in an error.
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
