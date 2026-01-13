// src/app/api/pi/approve/route.ts
// ✅ Server-Side Approval Endpoint

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { piBackend } from '@/lib/pi-network/backend';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const approveSchema = z.object({
  paymentId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate input
    const body = await request.json();
    const { paymentId } = approveSchema.parse(body);

    // 3. Get payment from Pi Network
    const payment = await piBackend.getPayment(paymentId);

    // 4. Verify payment belongs to this user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { piUsername: true },
    });

    if (payment.user_uid !== user?.piUsername) {
      return NextResponse.json(
        { error: 'Payment does not belong to this user' },
        { status: 403 }
      );
    }

    // 5. Check if payment already exists in database
    const existingPayment = await prisma.payment.findUnique({
      where: { piPaymentId: paymentId },
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Payment already processed' },
        { status: 400 }
      );
    }

    // 6. Approve payment with Pi Network
    await piBackend.approvePayment(paymentId);

    // 7. Store in database
    await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: payment.amount,
        currency: 'PI',
        piAmount: payment.amount,
        paymentMethod: 'pi_network',
        piPaymentId: paymentId,
        status: 'pending',
        metadata: {
          memo: payment.memo,
          ...payment.metadata,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment approved',
      paymentId,
    });
  } catch (error) {
    console.error('Payment approval error:', error);
    return NextResponse.json(
      { error: 'Payment approval failed' },
      { status: 500 }
    );
  }
}
