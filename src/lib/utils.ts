import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/* دالة أساسية لازمة لعمل shadcn/ui */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ══════════════════════════════════════════
   PRICES — Pi only
   Pi Mainnet requires every transaction to be in Pi, so every price shown to
   the user is shown in Pi (π). Catalogue prices are stored in a source
   currency (hotel.currency etc.); they are converted with the SAME
   PI_PER_<CUR> rates the server charges with (see src/lib/pricing.ts and the
   NEXT_PUBLIC_PI_RATES bridge in next.config.mjs). No fiat amount is shown.
══════════════════════════════════════════ */

let ratesRaw: string | undefined;
let ratesParsed: Record<string, number> = {};

function piRates(): Record<string, number> {
  const raw = process.env.NEXT_PUBLIC_PI_RATES;
  if (raw !== ratesRaw) {
    ratesRaw = raw;
    try {
      const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
      ratesParsed = Object.fromEntries(
        Object.entries(parsed).filter(([, v]) => typeof v === 'number' && Number.isFinite(v) && v > 0)
      ) as Record<string, number>;
    } catch {
      ratesParsed = {};
    }
  }
  return ratesParsed;
}

/**
 * Converts an amount in `currencyCode` to Pi for DISPLAY. Mirrors
 * toPiAmount() on the server: 'PI' passes through; an unconfigured rate is
 * 1:1 only outside production, and unknown (null) in production.
 */
export function toPiDisplay(amount: number, currencyCode: string = 'USD'): number | null {
  const cur = (currencyCode || 'USD').toUpperCase();
  if (cur === 'PI') {return amount;}
  const rate = piRates()[cur];
  if (rate) {return amount * rate;}
  return process.env.NODE_ENV === 'production' ? null : amount;
}

/** Formats a Pi amount, e.g. "π 12.5". */
export function formatPi(amountPi: number): string {
  const n = Number.isFinite(amountPi) ? amountPi : 0;
  return `π ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n)}`;
}

/**
 * Price label shown across the app. The name/signature are unchanged so every
 * existing call site keeps working, but the result is now always in Pi.
 */
export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  const pi = toPiDisplay(Number.isFinite(amount) ? amount : 0, currencyCode);
  return pi === null ? 'π —' : formatPi(pi);
}

/* ══════════════════════════════════════════
   UTILS — دوال مساعدة عامة
══════════════════════════════════════════ */

export function $(id: string): HTMLElement | null {
  if (typeof document === 'undefined') {return null;}
  return document.getElementById(id);
}

export function esc(s: unknown): string {
  return String(s).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[m] as string));
}

export function fp(p: number, currency: 'USD' | 'PI' = 'USD', piRate: number = 0.4): string {
  return currency === 'USD' ? `$${Math.round(p)}` : `${(p / piRate).toFixed(2)} π`;
}

export function toast(msg: string, type = '') {
  if (typeof document === 'undefined') {return;}
  const t = $('toastEl') as (HTMLElement & { _t?: ReturnType<typeof setTimeout> }) | null;
  if (!t) {return;}
  t.textContent = msg;
  t.className = 'toast ' + (type || '');
  t.classList.add('on');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('on'), 2900);
}

export function toggleTheme() {
  if (typeof document === 'undefined') {return;}
  const d = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', d ? 'light' : 'dark');
}

export function counterAnim(el: HTMLElement, target: number) {
  let n = 0;
  const s = target / 55;
  const r = () => {
    n += s;
    if (n >= target) {
      el.textContent = String(Math.round(target));
      return;
    }
    el.textContent = String(Math.floor(n));
    requestAnimationFrame(r);
  };
  r();
}
