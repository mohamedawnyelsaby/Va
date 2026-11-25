'use client';
// PATH: src/components/layout/SafeAreaFix.tsx
// Pi Browser is an Android WebView that draws the page UNDER the system back/home
// buttons but reports a 0 safe-area inset, so the bottom navigation ended up hidden
// behind them. When that is the situation, reserve room for the buttons ourselves by
// setting --safe-b-fallback (read by src/app/responsive.css).
//
// Tuning without a redeploy: open any page once with ?safeb=<px> (e.g. ?safeb=64).
// The value is remembered on that device. ?safeb=0 switches the fallback off.
import { useEffect } from 'react';

const DEFAULT_PX = 48; // height of the standard 3-button Android navigation bar

export default function SafeAreaFix() {
  useEffect(() => {
    const root = document.documentElement;
    const apply = (px: number) => root.style.setProperty('--safe-b-fallback', `${px}px`);
    const valid = (v: string | null): v is string => v !== null && /^\d{1,3}$/.test(v);

    try {
      const q = new URLSearchParams(window.location.search).get('safeb');
      if (valid(q)) { localStorage.setItem('va_safe_b', String(Math.min(120, Number(q)))); }
      const saved = localStorage.getItem('va_safe_b');
      if (valid(saved)) { apply(Math.min(120, Number(saved))); return; }
    } catch { /* storage blocked: fall through to auto-detect */ }

    const ua = navigator.userAgent;
    const inAppWebView = /Android/i.test(ua) && (/PiBrowser/i.test(ua) || /; wv\)/.test(ua));
    if (!inAppWebView) { return; }

    // Does the browser report a real bottom inset? If so, trust it.
    const probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;padding-bottom:env(safe-area-inset-bottom,0px)';
    document.body.appendChild(probe);
    const inset = parseFloat(getComputedStyle(probe).paddingBottom) || 0;
    probe.remove();
    if (inset < 1) { apply(DEFAULT_PX); }
  }, []);

  return null;
}
