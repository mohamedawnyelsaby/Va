import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/* دالة أساسية لازمة لعمل shadcn/ui */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* تنسيق العملة - مستخدمة في صفحات كتير بالمشروع */
export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (e) {
    return `$${Math.round(amount)}`;
  }
}

/* ══════════════════════════════════════════
   UTILS — دوال مساعدة عامة
══════════════════════════════════════════ */

export function $(id: string): HTMLElement | null {
  if (typeof document === 'undefined') return null;
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
  if (typeof document === 'undefined') return;
  const t = $('toastEl') as (HTMLElement & { _t?: ReturnType<typeof setTimeout> }) | null;
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast ' + (type || '');
  t.classList.add('on');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('on'), 2900);
}

export function toggleTheme() {
  if (typeof document === 'undefined') return;
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
