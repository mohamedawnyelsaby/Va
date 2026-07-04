'use client';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { currency, PI_RATE, savePrefs } from './state';

/* ══════════════════════════════════════════
   دالة أساسية لازمة لعمل shadcn/ui - متمسّش
══════════════════════════════════════════ */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

export function fp(p: number): string {
  return currency === 'USD' ? `$${Math.round(p)}` : `${(p / PI_RATE).toFixed(2)} π`;
}

export function toast(msg: string, type = '') {
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
  savePrefs();
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
