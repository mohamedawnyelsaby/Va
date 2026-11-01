// src/lib/pi-network/sandbox.ts
//
// Decides whether Pi.init() must run in sandbox (Testnet) mode.
//
// Pi.authenticate() hangs or fails when the SDK is initialised in the wrong
// mode for how Pi Browser opened the app. The build-time flag
// (NEXT_PUBLIC_PI_SANDBOX) is easy to get wrong across two Vercel projects, so
// the app also detects it at runtime: Pi Browser opens Testnet apps inside
// https://sandbox.minepi.com, which shows up as the page's parent origin or
// referrer. Production (Mainnet) is never opened that way.
//
// This only selects the CLIENT SDK mode. Real security is unaffected: every
// token is verified server-side against Pi's API with the app's own key.

export const PI_SANDBOX_HOST = 'sandbox.minepi.com';

export interface SandboxSignals {
  envFlag: boolean;
  ancestorOrigins: string[];
  referrer: string;
}

export function readSandboxSignals(): SandboxSignals {
  const envFlag = process.env.NEXT_PUBLIC_PI_SANDBOX === 'true';
  if (typeof window === 'undefined') {
    return { envFlag, ancestorOrigins: [], referrer: '' };
  }
  let ancestorOrigins: string[] = [];
  try {
    const list = window.location.ancestorOrigins;
    ancestorOrigins = list ? Array.from(list) : [];
  } catch {
    ancestorOrigins = [];
  }
  let referrer = '';
  try {
    referrer = document.referrer || '';
  } catch {
    referrer = '';
  }
  return { envFlag, ancestorOrigins, referrer };
}

export function isPiSandbox(signals: SandboxSignals = readSandboxSignals()): boolean {
  if (signals.envFlag) {return true;}
  if (signals.ancestorOrigins.some((o) => o.includes(PI_SANDBOX_HOST))) {return true;}
  return signals.referrer.includes(PI_SANDBOX_HOST);
}
