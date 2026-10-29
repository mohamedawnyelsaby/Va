// src/instrumentation.ts
// Runs once when the server starts. Fails fast on an invalid production
// configuration (see src/lib/config/validate-env.ts).

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv } = await import('@/lib/config/validate-env');
    validateEnv();
  }
}
