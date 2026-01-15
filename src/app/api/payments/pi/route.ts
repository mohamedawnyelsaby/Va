// src/app/api/payments/pi/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';

// Note: Payment and Booking models are not in the current Prisma schema
// This endpoint returns mock responses until these models are added

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentId, bookingId, amount } = await request.json();

    // TODO: Add Payment and Booking models to Prisma schema
    console.log('Pi payment request:', {
      userId: session.user.id,
      paymentId,
      bookingId,
      amount,
    });

    // Mock successful response
    return NextResponse.json({
      success: true,
      message: 'Payment functionality not yet available',
      data: {
        paymentId,
        bookingId,
        amount,
        currency: 'PI',
        status: 'pending',
      },
    }, { status: 501 }); // Not Implemented
  } catch (error) {
    console.error('Pi payment error:', error);
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 });
  }
}
