// src/app/api/health/route.ts
// Health check for Railway / Docker / uptime monitors.
//
// FIX: this endpoint is public, and it used to return raw database error text,
// the names of missing environment variables, memory and uptime figures. It
// now reveals only whether the app is up and whether the database answers.
//
// DIAGNOSTIC (opt-in): GET /api/health?probe=1 additionally reads one row from
// each main table and reports, per table, either "ok" or the Prisma error CODE
// (+ the missing column/table name for P2022/P2021). That is how to tell from a
// phone — no log access needed — whether a failure is "can't reach the DB"
// (P1xxx) or "the DB schema is behind the code" (P2021/P2022). Never returns
// messages, connection details or row data; the schema itself is public (the
// repo is open source). Rate limited because it runs several queries.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Prisma errors are recognised by SHAPE (their `code`), the same way
// isUniqueViolation() does, rather than with instanceof: it keeps working
// across Prisma versions and module boundaries.
interface PrismaLikeError {
  code?: unknown;          // "P2022" ... on request errors
  errorCode?: unknown;     // "P1001" ... on initialization errors
  meta?: { column?: unknown; table?: unknown };
}

async function probe(read: () => Promise<unknown>): Promise<string> {
  try {
    await read();
    return 'ok';
  } catch (error) {
    const e = (typeof error === 'object' && error !== null ? error : {}) as PrismaLikeError;
    const code = typeof e.code === 'string' ? e.code : typeof e.errorCode === 'string' ? e.errorCode : null;
    if (!code) {return 'ERROR';}
    const where = typeof e.meta?.column === 'string' ? e.meta.column : typeof e.meta?.table === 'string' ? e.meta.table : '';
    return where ? `${code} ${where}` : code;
  }
}

// Which Pi network each public hostname is registered for in the Pi Developer
// Portal (see the validation keys in middleware.ts). A deployment can only serve
// ONE network: the server talks to Pi with a single PI_API_KEY, and that key
// belongs to either the Testnet app or the Mainnet app.
const HOST_NETWORK: Record<string, 'testnet' | 'mainnet'> = {
  'va-pied.vercel.app': 'testnet',
  'va-mainnet.vercel.app': 'mainnet',
};

/** GET /api/health?pi=1 : Pi configuration check. Never returns secret values. */
function piConfigReport(host: string) {
  const clientIsSandbox = process.env.NEXT_PUBLIC_PI_SANDBOX === 'true';
  const hostExpects = HOST_NETWORK[host.toLowerCase()] ?? null;
  const clientMatchesHost = hostExpects ? (hostExpects === 'testnet') === clientIsSandbox : null;
  return {
    host,
    // What the browser SDK is told at build time (Pi.init({ sandbox })).
    clientNetwork: clientIsSandbox ? 'testnet (sandbox)' : 'mainnet',
    apiKeyConfigured: Boolean(process.env.PI_API_KEY),
    hostExpects,
    clientMatchesHost,
    warning:
      clientMatchesHost === false
        ? 'This hostname is registered for a different Pi network than this deployment is built for. Payments here would be created on one network and verified on the other.'
        : null,
  };
}

export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();
  const wantsProbe = request.nextUrl.searchParams.get('probe') === '1';

  if (request.nextUrl.searchParams.get('pi') === '1') {
    const limited = await checkRateLimit(request, 'search');
    if (limited) {return limited;}
    return NextResponse.json(
      { pi: piConfigReport(request.headers.get('host') ?? ''), timestamp },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }

  if (wantsProbe) {
    const limited = await checkRateLimit(request, 'search');
    if (limited) {return limited;}

    const [connection, hotel, city, attraction, restaurant, user, booking, favorite] = await Promise.all([
      probe(() => prisma.$queryRaw`SELECT 1`),
      probe(() => prisma.hotel.findFirst()),
      probe(() => prisma.city.findFirst()),
      probe(() => prisma.attraction.findFirst()),
      probe(() => prisma.restaurant.findFirst()),
      probe(() => prisma.user.findFirst({ select: { id: true } })),
      probe(() => prisma.booking.findFirst()),
      probe(() => prisma.favorite.findFirst()),
    ]);
    // `user` selects only the id on purpose (no personal data is read), so also
    // check the two columns added later by name.
    const userColumns = await probe(() => prisma.user.findFirst({ select: { resetTokenHash: true, resetTokenExpiry: true } }));

    const probes = { connection, hotel, city, attraction, restaurant, user, userColumns, booking, favorite };
    const allOk = Object.values(probes).every((v) => v === 'ok');
    return NextResponse.json(
      { status: allOk ? 'healthy' : 'degraded', timestamp, probe: probes },
      { status: allOk ? 200 : 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

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
