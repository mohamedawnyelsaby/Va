// src/app/api/health/route.ts
// Health check for Railway / Docker / uptime monitors.
//
// FIX: this endpoint is public, and it used to return raw database error text,
// the names of missing environment variables, memory and uptime figures. It
// now reveals only whether the app is up and whether the database answers.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const timestamp = new Date().toISOString();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { status: 'healthy', timestamp },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    // Details go to the server logs only.
    logger.error('Health check: database unreachable:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { status: 'unhealthy', timestamp },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
