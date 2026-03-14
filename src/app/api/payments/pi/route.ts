import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;
    if (!userId) {
      const guest = await prisma.user.findFirst({ where: { email: 'guest@pi.network' } });
      userId = guest?.id || 'guest';
    }

    const { paymentId, bookingId, amount } = await request.json();

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'confirmed', piPaymentId: paymentId || 'pi_' + Date.now() },
    }).catch(() => {});

    return NextResponse.json({ success: true, paymentId: paymentId || 'pi_' + Date.now() });
  } catch (error) {
    console.error('Pi payment error:', error);
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 });
  }
}
