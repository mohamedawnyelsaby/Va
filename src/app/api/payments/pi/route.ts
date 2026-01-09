// src/app/api/payments/pi/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, transactionId, amount, currency, userId } = body;

    // Verify Pi Network payment
    const isValid = await verifyPiPayment(paymentId, transactionId);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment' },
        { status: 400 }
      );
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        currency,
        paymentMethod: 'pi_network',
        piPaymentId: paymentId,
        transactionId,
        status: 'completed',
        metadata: { verifiedAt: new Date().toISOString() }
      }
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      message: 'Payment completed successfully'
    });
  } catch (error) {
    console.error('Pi payment error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}

async function verifyPiPayment(paymentId: string, transactionId: string) {
  // Implement Pi Network payment verification
  const piApiUrl = process.env.PI_NETWORK_API_URL || 'https://api.minepi.com';
  const apiKey = process.env.PI_API_KEY;

  const response = await fetch(`${piApiUrl}/v2/payments/${paymentId}`, {
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) return false;

  const data = await response.json();
  return data.status === 'completed' && data.transaction_id === transactionId;
}
