// src/lib/security/audit-logger.ts
import { prisma } from '@/lib/db';

interface AuditLogData {
  action: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogger {
  static async log(data: AuditLogData) {
    try {
      await prisma.auditLog.create({
        data: {
          action: data.action,
          userId: data.userId,
          entityType: data.entityType,
          entityId: data.entityId,
          changes: data.changes ? JSON.stringify(data.changes) : undefined,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      console.error('Audit log error:', error);
    }
  }

  static async getByUser(userId: string, limit = 50) {
    return await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  static async getByAction(action: string, limit = 50) {
    return await prisma.auditLog.findMany({
      where: { action },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  static async getByEntityType(entityType: string, limit = 50) {
    return await prisma.auditLog.findMany({
      where: { entityType },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  static async deleteOldLogs(daysToKeep = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    return await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
  }
}
