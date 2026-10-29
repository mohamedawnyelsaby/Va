// src/lib/config/validate-env.ts
//
// Startup configuration validation (called from src/instrumentation.ts).
//
// The strict rules apply when APP_ENV=production. That variable is the
// explicit "this is the real mainnet deployment" switch. It is separate from
// NODE_ENV on purpose: the Pi Testnet app is also deployed as a Vercel
// *production* build (NODE_ENV=production) and legitimately runs with
// PI_SANDBOX=true, so NODE_ENV alone cannot tell the two apart.
//
//   APP_ENV=production  -> any problem below is FATAL (the server refuses to start)
//   anything else       -> the same problems are logged as warnings only

export interface EnvIssue {
  level: 'error' | 'warning';
  message: string;
}

type Env = Record<string, string | undefined>;

const has = (env: Env, key: string) => Boolean(env[key]?.trim());

/** Currencies the shop sells in. Comma-separated; defaults to USD. */
function activeCurrencies(env: Env): string[] {
  return (env.ACTIVE_CURRENCIES ?? 'USD')
    .split(',')
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
}

export function collectEnvIssues(env: Env = process.env): EnvIssue[] {
  const strict = env.APP_ENV === 'production';
  const level: EnvIssue['level'] = strict ? 'error' : 'warning';
  const issues: EnvIssue[] = [];
  const add = (message: string) => issues.push({ level, message });

  // Core: database + auth
  for (const key of ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL']) {
    if (!has(env, key)) {add(`${key} is required`);}
  }
  if (strict && has(env, 'NEXTAUTH_SECRET') && (env.NEXTAUTH_SECRET as string).length < 32) {
    add('NEXTAUTH_SECRET must be at least 32 characters');
  }
  if (strict && has(env, 'NEXTAUTH_URL') && !(env.NEXTAUTH_URL as string).startsWith('https://')) {
    add('NEXTAUTH_URL must be an https:// URL in production');
  }

  // Pi platform credentials
  for (const key of ['PI_API_KEY', 'PI_SECRET_KEY', 'NEXT_PUBLIC_PI_APP_ID']) {
    if (!has(env, key)) {add(`${key} is required`);}
  }

  // Sandbox must never run as the production deployment.
  if (strict) {
    if (env.PI_SANDBOX === 'true') {add('PI_SANDBOX must not be "true" when APP_ENV=production');}
    if (env.NEXT_PUBLIC_PI_SANDBOX === 'true') {
      add('NEXT_PUBLIC_PI_SANDBOX must not be "true" when APP_ENV=production');
    }
    if (!has(env, 'PI_MAINNET_WALLET_SEED')) {
      add('PI_MAINNET_WALLET_SEED is required in production (A2U refunds cannot run without it)');
    }
    if (has(env, 'PI_TESTNET_WALLET_SEED')) {
      add('PI_TESTNET_WALLET_SEED must not be set on a production deployment');
    }
    if (!has(env, 'CRON_SECRET')) {
      add('CRON_SECRET is required in production (payment reconciliation cron)');
    }
    if (has(env, 'ALLOW_PROD_SEED')) {
      add('ALLOW_PROD_SEED must not be set in production');
    }
    if (!has(env, 'CORS_ALLOWED_ORIGINS') && !has(env, 'NEXT_PUBLIC_APP_URL')) {
      add('Set NEXT_PUBLIC_APP_URL (and CORS_ALLOWED_ORIGINS if other origins need API access)');
    }
  }

  // Pi conversion rate for every active currency.
  for (const cur of activeCurrencies(env)) {
    const raw = env[`PI_PER_${cur}`];
    const n = Number(raw);
    if (!raw || !Number.isFinite(n) || n <= 0) {
      add(`PI_PER_${cur} must be a positive number (active currency ${cur})`);
    }
  }

  return issues;
}

/** Throws when APP_ENV=production and anything is wrong; otherwise only logs. */
export function validateEnv(
  env: Env = process.env,
  log: Pick<Console, 'warn' | 'error'> = console
): void {
  const issues = collectEnvIssues(env);
  const errors = issues.filter((i) => i.level === 'error');

  for (const w of issues.filter((i) => i.level === 'warning')) {
    log.warn(`[config] ${w.message}`);
  }
  if (errors.length > 0) {
    for (const e of errors) {log.error(`[config] ${e.message}`);}
    throw new Error(
      `Invalid production configuration (${errors.length} problem${errors.length > 1 ? 's' : ''}): ` +
        errors.map((e) => e.message).join('; ')
    );
  }
}
