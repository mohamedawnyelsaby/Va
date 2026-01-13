import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentId, bookingId, amount } = await request.json();

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        userId: session.user.id,
        amount,
        currency: 'PI',
        status: 'pending',
        piPaymentId: paymentId,
        metadata: { memo: 'Pi payment' },
      } as any,
    });

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error('Pi payment error:', error);
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 });
  }
}
