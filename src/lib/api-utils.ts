// src/lib/api-utils.ts
// Small helpers shared by API routes: safe query-string parsing so that
// user input can never produce NaN, negative skips, unbounded page sizes or
// arbitrary Prisma `orderBy` keys.

export function clampInt(
  raw: string | null | undefined,
  fallback: number,
  min: number,
  max: number
): number {
  const n = Number.parseInt(raw ?? '', 10);
  if (!Number.isFinite(n)) {return fallback;}
  return Math.min(max, Math.max(min, n));
}

export function parseFiniteNumber(raw: string | null | undefined): number | undefined {
  if (raw === null || raw === undefined || raw.trim() === '') {return undefined;}
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

export function parsePagination(
  searchParams: URLSearchParams,
  defaultLimit = 12,
  maxLimit = 50
): { page: number; limit: number; skip: number } {
  const page = clampInt(searchParams.get('page'), 1, 1, 10_000);
  const limit = clampInt(searchParams.get('limit'), defaultLimit, 1, maxLimit);
  return { page, limit, skip: (page - 1) * limit };
}

/** Returns `raw` only if it is one of the allowed values, else `fallback`. */
export function pickAllowed<T extends string>(
  raw: string | null | undefined,
  allowed: readonly T[],
  fallback: T
): T {
  return allowed.find((a) => a === raw) ?? fallback;
}

/** Best-effort client IP (Vercel sets x-forwarded-for). */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || 'unknown';
}
