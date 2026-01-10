// src/lib/security/audit-logger.ts
// 📋 Comprehensive Audit Logging System

import { prisma } from '@/lib/db';
import { SecurityEncryption } from './encryption';

interface AuditLogData {
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

interface SecurityLogData {
  userId?: string;
  action: string;
  success: boolean;
  failureReason?: string;
  ipAddress: string;
  userAgent: string;
  metadata?: any;
}

export class AuditLogger {
  /**
   * Log user action
   */
  static async logAction(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          changes: data.changes ? JSON.stringify(data.changes) : null,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      console.error('Audit log error:', error);
      // Don't throw - logging should not break app flow
    }
  }

  /**
   * Log security event
   */
  static async logSecurityEvent(data: SecurityLogData): Promise<void> {
    try {
      await prisma.securityLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          success: data.success,
          failureReason: data.failureReason,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        },
      });

      // Alert on critical security events
      if (this.isCriticalEvent(data.action) && !data.success) {
        await this.sendSecurityAlert(data);
      }
    } catch (error) {
      console.error('Security log error:', error);
    }
  }

  /**
   * Log authentication attempt
   */
  static async logAuth(
    action: 'login' | 'logout' | 'signup' | 'password_reset' | '2fa_verify',
    success: boolean,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
    metadata?: any
  ): Promise<void> {
    await this.logSecurityEvent({
      userId,
      action,
      success,
      ipAddress: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown',
      metadata,
    });
  }

  /**
   * Log data access
   */
  static async logDataAccess(
    userId: string,
    entityType: string,
    entityId: string,
    action: 'view' | 'create' | 'update' | 'delete',
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    await this.logAction({
      userId,
      action: `${entityType}_${action}`,
      entityType,
      entityId,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log sensitive data change
   */
  static async logSensitiveChange(
    userId: string,
    field: string,
    oldValue: any,
    newValue: any,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    // Don't log actual sensitive values, just that they changed
    const sanitizedOld = this.sanitizeSensitiveData(field, oldValue);
    const sanitizedNew = this.sanitizeSensitiveData(field, newValue);

    await this.logAction({
      userId,
      action: 'sensitive_data_change',
      entityType: 'user',
      entityId: userId,
      changes: {
        field,
        oldValue: sanitizedOld,
        newValue: sanitizedNew,
      },
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log payment transaction
   */
  static async logPayment(
    userId: string,
    amount: number,
    currency: string,
    method: string,
    status: string,
    transactionId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    await this.logAction({
      userId,
      action: 'payment',
      entityType: 'payment',
      entityId: transactionId,
      changes: {
        amount,
        currency,
        method,
        status,
      },
      ipAddress,
      userAgent,
    });

    // Also log as security event for high amounts
    if (amount > 10000) {
      await this.logSecurityEvent({
        userId,
        action: 'high_value_payment',
        success: status === 'completed',
        ipAddress,
        userAgent,
        metadata: {
          amount,
          currency,
          transactionId,
        },
      });
    }
  }

  /**
   * Get user activity history
   */
  static async getUserActivity(
    userId: string,
    limit: number = 100
  ): Promise<any[]> {
    return await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get security events for user
   */
  static async getUserSecurityEvents(
    userId: string,
    limit: number = 50
  ): Promise<any[]> {
    return await prisma.securityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get failed login attempts
   */
  static async getFailedLogins(
    userId?: string,
    ipAddress?: string,
    hours: number = 24
  ): Promise<any[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const where: any = {
      action: 'failed_login',
      success: false,
      createdAt: { gte: since },
    };

    if (userId) where.userId = userId;
    if (ipAddress) where.ipAddress = ipAddress;

    return await prisma.securityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get suspicious activities
   */
  static async getSuspiciousActivities(hours: number = 24): Promise<any[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    return await prisma.securityLog.findMany({
      where: {
        success: false,
        createdAt: { gte: since },
        action: {
          in: [
            'failed_login',
            'brute_force_attempt',
            'sql_injection_attempt',
            'xss_attempt',
            'session_anomaly',
            'ip_blocked',
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Generate security report
   */
  static async generateSecurityReport(days: number = 7): Promise<any> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalEvents,
      failedLogins,
      blockedIPs,
      suspiciousActivities,
      successfulLogins,
      passwordResets,
      twoFactorEnabled,
    ] = await Promise.all([
      prisma.securityLog.count({
        where: { createdAt: { gte: since } },
      }),
      prisma.securityLog.count({
        where: {
          action: 'failed_login',
          success: false,
          createdAt: { gte: since },
        },
      }),
      prisma.securityLog.count({
        where: {
          action: 'ip_blocked',
          createdAt: { gte: since },
        },
      }),
      prisma.securityLog.count({
        where: {
          success: false,
          createdAt: { gte: since },
          action: {
            in: [
              'brute_force_attempt',
              'sql_injection_attempt',
              'xss_attempt',
              'session_anomaly',
            ],
          },
        },
      }),
      prisma.securityLog.count({
        where: {
          action: 'login',
          success: true,
          createdAt: { gte: since },
        },
      }),
      prisma.securityLog.count({
        where: {
          action: 'password_reset',
          success: true,
          createdAt: { gte: since },
        },
      }),
      prisma.user.count({
        where: { twoFactorEnabled: true },
      }),
    ]);

    return {
      period: `Last ${days} days`,
      summary: {
        totalSecurityEvents: totalEvents,
        failedLogins,
        blockedIPs,
        suspiciousActivities,
        successfulLogins,
        passwordResets,
        twoFactorEnabledUsers: twoFactorEnabled,
      },
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Export audit logs (GDPR compliance)
   */
  static async exportUserData(userId: string): Promise<any> {
    const [auditLogs, securityLogs, user] = await Promise.all([
      prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.securityLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          bookings: true,
          reviews: true,
          preferences: true,
        },
      }),
    ]);

    return {
      user: this.sanitizeUserData(user),
      auditLogs,
      securityLogs,
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * Delete user data (GDPR compliance)
   */
  static async deleteUserData(userId: string): Promise<void> {
    // Log the deletion request
    await this.logAction({
      userId,
      action: 'user_data_deletion',
      entityType: 'user',
      entityId: userId,
      ipAddress: 'system',
      userAgent: 'system',
    });

    // Anonymize instead of hard delete (for audit trail)
    await prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted_${userId}@deleted.com`,
        name: 'Deleted User',
        phone: null,
        avatar: null,
        bio: null,
        isActive: false,
        password: SecurityEncryption.generateToken(),
        piWalletId: null,
        piUsername: null,
      },
    });
  }

  // Private helper methods

  private static isCriticalEvent(action: string): boolean {
    const criticalEvents = [
      'multiple_failed_logins',
      'brute_force_attempt',
      'sql_injection_attempt',
      'xss_attempt',
      'session_hijacking',
      'unauthorized_access',
      'data_breach_attempt',
    ];

    return criticalEvents.includes(action);
  }

  private static async sendSecurityAlert(data: SecurityLogData): Promise<void> {
    // TODO: Implement email/SMS/webhook alerts
    console.error('🚨 SECURITY ALERT:', {
      action: data.action,
      userId: data.userId,
      ipAddress: data.ipAddress,
      timestamp: new Date().toISOString(),
    });

    // You could integrate with services like:
    // - SendGrid for emails
    // - Twilio for SMS
    // - PagerDuty for alerts
    // - Slack webhooks
    // - Discord webhooks
  }

  private static sanitizeSensitiveData(field: string, value: any): string {
    const sensitiveFields = [
      'password',
      'creditCard',
      'ssn',
      'pin',
      'secret',
    ];

    if (sensitiveFields.some((f) => field.toLowerCase().includes(f))) {
      return '[REDACTED]';
    }

    return value;
  }

  private static sanitizeUserData(user: any): any {
    if (!user) return null;

    const { password, twoFactorSecret, ...sanitized } = user;
    return sanitized;
  }
}
