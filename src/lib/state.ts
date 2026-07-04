export let lang: 'ar' | 'en' = 'ar';
export let currency: 'USD' | 'PI' = 'USD';
export let wishlist: string[] = [];
export let carIdx: Record<string, number> = {};

export const PI_RATE = 0.4;

export let bkStep = 1;
export let bkHotel: string | null = null;
export let bkRoom: string | null = null;
export let bkNights = 3;

export let predChartInst: any = null;
export let isSending = false;
export let isListening = false;
export let SR: any = null;

export let mapInited = false;

export let chatHistory: any[] = [];
export let moodHistory: any[] = [];
export let translationHistory: any[] = [];

export let payMethod = 0;
export let bnplOpt = -1;

export let lastItinerary: any = null;
export let lastItinDest = '';

export let guestData: Record<string, any> = {};

export let piUser: any = null;
export let piAuthenticated = false;
export let piSDKReady = false;

export let onbStep_idx = 0;
export let deferredInstall: any = null;

export function savePrefs() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      'vt_prefs',
      JSON.stringify({
        lang,
        currency,
        theme: document.documentElement.getAttribute('data-theme'),
        wishlist,
      })
    );
  } catch (e) {}
}

export function loadPrefs() {
  if (typeof window === 'undefined') return;
  try {
    const p = JSON.parse(localStorage.getItem('vt_prefs') || '{}');
    if (p.lang) lang = p.lang;
    if (p.currency === 'USD' || p.currency === 'PI') currency = p.currency;
    if (p.theme) document.documentElement.setAttribute('data-theme', p.theme);
    if (p.wishlist) wishlist = p.wishlist;
  } catch (e) {}
}

export function saveCache(k: string, d: any) {
  if (typeof window === 'undefined') return;
  try {
    const c = JSON.parse(localStorage.getItem('vt2_cache') || '{}');
    c[k] = { d, t: Date.now() };
    localStorage.setItem('vt2_cache', JSON.stringify(c));
  } catch (e) {}
}

export function loadCache(k: string, mx = 3600000) {
  if (typeof window === 'undefined') return null;
  try {
    const c = JSON.parse(localStorage.getItem('vt2_cache') || '{}');
    const i = c[k];
    if (i && Date.now() - i.t < mx) return i.d;
  } catch (e) {}
  return null;
}

export const RL = (() => {
  const MAX = 10;
  const WIN = 60000;
  let calls: number[] = [];

  function remaining() {
    const n = Date.now();
    calls = calls.filter((t) => n - t < WIN);
    return MAX - calls.length;
  }

  function consume() {
    if (remaining() <= 0) return false;
    calls.push(Date.now());
    updateRLBadge();
    return true;
  }

  return { remaining, consume };
})();

export function updateRLBadge() {
  if (typeof document === 'undefined') return;
  const r = RL.remaining();
  const el = document.getElementById('rlCount');
  const b = document.getElementById('rlBadge');
  if (!el || !b) return;
  el.textContent = String(r);
  b.className = 'rl-badge' + (r <= 2 ? ' warn' : '');
}
