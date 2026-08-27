export let lang: 'ar' | 'en' = 'ar';
export let currency: 'USD' | 'PI' = 'USD';
export let wishlist: string[] = [];
export const carIdx: Record<string, number> = {};

export const PI_RATE = 0.4;

export const bkStep = 1;
export const bkHotel: string | null = null;
export const bkRoom: string | null = null;
export const bkNights = 3;

export const predChartInst: any = null;
export const isSending = false;
export const isListening = false;
export const SR: any = null;

export const mapInited = false;

export const chatHistory: any[] = [];
export const moodHistory: any[] = [];
export const translationHistory: any[] = [];

export const payMethod = 0;
export const bnplOpt = -1;

export const lastItinerary: any = null;
export const lastItinDest = '';

export const guestData: Record<string, any> = {};

export const piUser: any = null;
export const piAuthenticated = false;
export const piSDKReady = false;

export const onbStep_idx = 0;
export const deferredInstall: any = null;

export function savePrefs() {
  if (typeof window === 'undefined') {return;}
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
  } catch {
    // ignore malformed/unavailable localStorage data
  }
}

export function loadPrefs() {
  if (typeof window === 'undefined') {return;}
  try {
    const p = JSON.parse(localStorage.getItem('vt_prefs') || '{}');
    if (p.lang) {lang = p.lang;}
    if (p.currency === 'USD' || p.currency === 'PI') {currency = p.currency;}
    if (p.theme) {document.documentElement.setAttribute('data-theme', p.theme);}
    if (p.wishlist) {wishlist = p.wishlist;}
  } catch {
    // ignore malformed/unavailable localStorage data
  }
}

export function saveCache(k: string, d: any) {
  if (typeof window === 'undefined') {return;}
  try {
    const c = JSON.parse(localStorage.getItem('vt2_cache') || '{}');
    c[k] = { d, t: Date.now() };
    localStorage.setItem('vt2_cache', JSON.stringify(c));
  } catch {
    // ignore malformed/unavailable localStorage data
  }
}

export function loadCache(k: string, mx = 3600000) {
  if (typeof window === 'undefined') {return null;}
  try {
    const c = JSON.parse(localStorage.getItem('vt2_cache') || '{}');
    const i = c[k];
    if (i && Date.now() - i.t < mx) {return i.d;}
  } catch {
    // ignore malformed/unavailable localStorage data
  }
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
    if (remaining() <= 0) {return false;}
    calls.push(Date.now());
    updateRLBadge();
    return true;
  }

  return { remaining, consume };
})();

export function updateRLBadge() {
  if (typeof document === 'undefined') {return;}
  const r = RL.remaining();
  const el = document.getElementById('rlCount');
  const b = document.getElementById('rlBadge');
  if (!el || !b) {return;}
  el.textContent = String(r);
  b.className = 'rl-badge' + (r <= 2 ? ' warn' : '');
}
