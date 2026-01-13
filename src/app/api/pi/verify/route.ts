// src/app/api/pi/verify/route.ts
// ✅ Verify Payment Status

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { piBackend } from '@/lib/pi-network/backend';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID required' },
        { status: 400 }
      );
    }

    // Get payment from Pi Network
    const piPayment = await piBackend.getPayment(paymentId);

    // Get payment from database
    const dbPayment = await prisma.payment.findUnique({
      where: { piPaymentId: paymentId },
    });

    return NextResponse.json({
      piNetwork: piPayment,
      database: dbPayment,
      synced: piPayment.status.developer_completed === (dbPayment?.status === 'completed'),
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
