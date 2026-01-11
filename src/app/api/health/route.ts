// src/app/api/health/route.ts
// ============================================
// Health Check API Endpoint
// Used by Railway, Docker, and monitoring services
// ============================================

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Disable caching for health checks
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  environment: string;
  checks: {
    database: {
      status: 'connected' | 'disconnected' | 'error';
      latency?: number;
      error?: string;
    };
    environment: {
      status: 'ok' | 'missing_vars';
      missing?: string[];
    };
    server: {
      uptime: number;
      memory: {
        used: number;
        total: number;
        percentage: number;
      };
    };
  };
}

export async function GET() {
  const startTime = Date.now();
  
  try {
    // ========================================
    // 1. Check Database Connection
    // ========================================
    let databaseStatus: HealthCheckResponse['checks']['database'] = {
      status: 'disconnected',
    };

    try {
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const dbLatency = Date.now() - dbStart;
      
      databaseStatus = {
        status: 'connected',
        latency: dbLatency,
      };
    } catch (dbError) {
      databaseStatus = {
        status: 'error',
        error: dbError instanceof Error ? dbError.message : 'Unknown database error',
      };
    }

    // ========================================
    // 2. Check Required Environment Variables
    // ========================================
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
    ];

    const missingEnvVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    const environmentStatus: HealthCheckResponse['checks']['environment'] = {
      status: missingEnvVars.length > 0 ? 'missing_vars' : 'ok',
      ...(missingEnvVars.length > 0 && { missing: missingEnvVars }),
    };

    // ========================================
    // 3. Check Server Resources
    // ========================================
    const memoryUsage = process.memoryUsage();
    const serverStatus: HealthCheckResponse['checks']['server'] = {
      uptime: process.uptime(),
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        percentage: Math.round(
          (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
        ),
      },
    };

    // ========================================
    // 4. Determine Overall Health Status
    // ========================================
    let overallStatus: HealthCheckResponse['status'] = 'healthy';

    if (
      databaseStatus.status === 'error' ||
      environmentStatus.status === 'missing_vars'
    ) {
      overallStatus = 'unhealthy';
    } else if (
      databaseStatus.status === 'disconnected' ||
      serverStatus.memory.percentage > 90
    ) {
      overallStatus = 'degraded';
    }

    // ========================================
    // 5. Build Response
    // ========================================
    const response: HealthCheckResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      checks: {
        database: databaseStatus,
        environment: environmentStatus,
        server: serverStatus,
      },
    };

    // ========================================
    // 6. Return Response with Appropriate Status Code
    // ========================================
    const statusCode = overallStatus === 'healthy' ? 200 : 503;

    return NextResponse.json(response, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Health-Check-Duration': `${Date.now() - startTime}ms`,
      },
    });
  } catch (error) {
    // ========================================
    // 7. Handle Unexpected Errors
    // ========================================
    console.error('Health check failed with unexpected error:', error);

    const errorResponse: HealthCheckResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      checks: {
        database: {
          status: 'error',
          error: 'Unable to perform health check',
        },
        environment: {
          status: 'ok',
        },
        server: {
          uptime: process.uptime(),
          memory: {
            used: 0,
            total: 0,
            percentage: 0,
          },
        },
      },
    };

    return NextResponse.json(errorResponse, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Health-Check-Duration': `${Date.now() - startTime}ms`,
      },
    });
  }
}

// Optional: HEAD request support for simple health checks
export async function HEAD() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
