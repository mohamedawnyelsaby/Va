// scripts/sync-db.mjs
//
// Brings the production database schema in line with prisma/schema.prisma
// as part of `npm run build`, so a deploy can never ship code that reads
// columns the database doesn't have yet.
//
// Why it lives in the build script and not only in `vercel-build`: Vercel
// uses `vercel-build` only when the project has no custom Build Command, and
// this project does (its build log shows plain `npm run build`), so a
// vercel-build-only hook silently never ran.
//
// Runs ONLY for a Vercel *production* build. Local builds, CI builds and
// preview deployments skip it (previews may share the production DATABASE_URL
// and must never alter its schema).
//
// Safe by design: `prisma db push` applies additive changes (new nullable
// columns, new tables) on its own, and in a non-interactive environment it
// REFUSES anything that would lose data ("Push cancelled") instead of
// applying it. A refusal or any other failure fails the build, so the
// previous (consistent) deployment keeps serving. Deliberately no
// --accept-data-loss.

import { spawnSync } from 'node:child_process';

const isVercelProduction = process.env.VERCEL === '1' && process.env.VERCEL_ENV === 'production';

if (!isVercelProduction) {
  console.log('[sync-db] skipped (not a Vercel production build)');
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  console.error('[sync-db] DATABASE_URL is not set — cannot sync the schema. Failing the build on purpose.');
  process.exit(1);
}

// schema.prisma declares directUrl = env("DIRECT_URL"); with no pooler it is
// the same value as DATABASE_URL (documented in .env.example).
const env = { ...process.env, DIRECT_URL: process.env.DIRECT_URL || process.env.DATABASE_URL };

console.log('[sync-db] syncing database schema (prisma db push, no data-loss flag)...');
const result = spawnSync('npx', ['prisma', 'db', 'push', '--skip-generate'], { stdio: 'inherit', env });

if (result.status !== 0) {
  console.error('[sync-db] schema sync failed — failing the build so the current deployment stays live.');
  process.exit(result.status ?? 1);
}
console.log('[sync-db] schema is in sync.');
