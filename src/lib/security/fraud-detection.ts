// src/lib/security/fraud-detection.ts
import { prisma } from '@/lib/db';

interface SuspiciousActivity {
  type: string;
  description: string;
  riskScore: number;
  metadata?: Record<string, any>;
}

export class FraudDetection {
  static async detectSuspiciousActivity(
    userId: string,
    activity: SuspiciousActivity
  ) {
    try {
      await prisma.securityLog.create({
        data: {
          userId,
          action: 'SUSPICIOUS_ACTIVITY',
          success: false,
          failureReason: activity.description,
          ipAddress: activity.metadata?.ipAddress || '',
          userAgent: activity.metadata?.userAgent || '',
          metadata: {
            activityType: activity.type,
            description: activity.description,
            riskScore: activity.riskScore,
          },
        },
      });

      // If risk score is high, take action
      if (activity.riskScore >= 80) {
        await this.blockUser(userId);
      }
    } catch (error) {
      console.error('Fraud detection error:', error);
    }
  }

  static async blockUser(userId: string) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });
    } catch (error) {
      console.error('Block user error:', error);
    }
  }

  static async logSecurityEvent(
    userId: string,
    action: string,
    success: boolean,
    ipAddress: string,
    userAgent: string,
    failureReason?: string
  ) {
    try {
      await prisma.securityLog.create({
        data: {
          userId,
          action,
          success,
          failureReason,
          ipAddress,
          userAgent,
        },
      });
    } catch (error) {
      console.error('Security log error:', error);
    }
  }
}
