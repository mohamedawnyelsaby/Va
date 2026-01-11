import { prisma } from '@/lib/db';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface FraudCheckResult {
  isFraud: boolean;
  riskScore: number;
  reasons: string[];
  recommendations: string[];
}

export async function checkBookingForFraud(
  userId: string,
  bookingData: {
    hotelId: string;
    amount: number;
    checkIn: Date;
    checkOut: Date;
    guestCount: number;
  }
): Promise<FraudCheckResult> {
  const reasons: string[] = [];
  let riskScore = 0;

  const recentBookings = await prisma.booking.count({
    where: {
      userId,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
  });

  if (recentBookings > 5) {
    riskScore += 30;
    reasons.push('Multiple bookings in 24 hours');
  } else if (recentBookings > 3) {
    riskScore += 15;
    reasons.push('Frequent bookings detected');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      createdAt: true,
      tier: true,
      _count: {
        select: { bookings: true },
      },
    },
  });

  if (user) {
    const accountAge = Date.now() - user.createdAt.getTime();
    const isNewUser = accountAge < 7 * 24 * 60 * 60 * 1000;

    if (isNewUser && bookingData.amount > 1000) {
      riskScore += 25;
      reasons.push('New user with high-value booking');
    }

    if (user._count.bookings === 0 && bookingData.amount > 500) {
      riskScore += 20;
      reasons.push('First booking with high amount');
    }
  }

  const nights = Math.ceil(
    (bookingData.checkOut.getTime() - bookingData.checkIn.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (nights > 30) {
    riskScore += 15;
    reasons.push('Unusually long stay duration');
  }

  if (bookingData.guestCount > 10) {
    riskScore += 10;
    reasons.push('Large guest count');
  }

  const sameHotelBookings = await prisma.booking.count({
    where: {
      userId,
      hotelId: bookingData.hotelId,
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  if (sameHotelBookings > 3) {
    riskScore += 10;
    reasons.push('Multiple bookings at same hotel');
  }

  const failedPayments = await prisma.payment.count({
    where: {
      userId,
      status: 'failed',
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
  });

  if (failedPayments > 3) {
    riskScore += 20;
    reasons.push('Multiple failed payment attempts');
  }

  const recommendations: string[] = [];
  
  if (riskScore >= 50) {
    recommendations.push('Require additional verification');
    recommendations.push('Contact user for confirmation');
    recommendations.push('Hold booking for manual review');
  } else if (riskScore >= 30) {
    recommendations.push('Monitor closely');
    recommendations.push('Verify payment method');
  }

  return {
    isFraud: riskScore >= 50,
    riskScore: Math.min(riskScore, 100),
    reasons,
    recommendations,
  };
}

export async function checkPaymentForFraud(
  userId: string,
  paymentData: {
    amount: number;
    method: string;
    ipAddress?: string;
  }
): Promise<FraudCheckResult> {
  const reasons: string[] = [];
  let riskScore = 0;

  const recentPayments = await prisma.payment.count({
    where: {
      userId,
      createdAt: {
        gte: new Date(Date.now() - 60 * 60 * 1000),
      },
    },
  });

  if (recentPayments > 5) {
    riskScore += 40;
    reasons.push('Multiple payments in short time');
  }

  const avgPayment = await prisma.payment.aggregate({
    _avg: { amount: true },
    where: { userId },
  });

  if (avgPayment._avg.amount) {
    const deviation = Math.abs(
      paymentData.amount - avgPayment._avg.amount
    ) / avgPayment._avg.amount;

    if (deviation > 3) {
      riskScore += 25;
      reasons.push('Unusual payment amount');
    }
  }

  if (paymentData.ipAddress) {
    const knownIP = await redis.sismember(
      `user:known-ips:${userId}`,
      paymentData.ipAddress
    );

    if (!knownIP) {
      riskScore += 15;
      reasons.push('Payment from unknown IP address');
    }
  }

  const usedMethod = await prisma.payment.findFirst({
    where: {
      userId,
      method: paymentData.method,
    },
  });

  if (!usedMethod) {
    riskScore += 10;
    reasons.push('New payment method');
  }

  const recommendations: string[] = [];
  
  if (riskScore >= 50) {
    recommendations.push('Block payment');
    recommendations.push('Require 2FA verification');
    recommendations.push('Contact user immediately');
  } else if (riskScore >= 30) {
    recommendations.push('Require additional verification');
    recommendations.push('Send confirmation email');
  }

  return {
    isFraud: riskScore >= 50,
    riskScore: Math.min(riskScore, 100),
    reasons,
    recommendations,
  };
}

export async function logSuspiciousActivity(
  userId: string,
  activity: {
    type: string;
    description: string;
    riskScore: number;
    metadata?: Record<string, any>;
  }
) {
  await prisma.securityLog.create({
    data: {
      userId,
      action: 'SUSPICIOUS_ACTIVITY',
      ipAddress: activity.metadata?.ipAddress || '',
      userAgent: activity.metadata?.userAgent || '',
      metadata: {
        activityType: activity.type,
        description: activity.description,
        riskScore: activity.riskScore,
        ...activity.metadata,
      },
    },
  });

  if (activity.riskScore >= 70) {
    console.warn(`HIGH RISK ACTIVITY: User ${userId}`, activity);
  }
}
