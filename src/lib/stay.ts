// PATH: src/lib/stay.ts
// Shared helpers for a "stay" (dates + guests + rooms) that travels between the home
// search box, the hotel list and the hotel page through the URL query string.

export const MAX_GUESTS = 20; // same limits the bookings API enforces
export const MAX_ROOMS = 10;

export const clamp = (n: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, n));

/** Local calendar date as YYYY-MM-DD (toISOString() is UTC and can be a day off). */
export function localISO(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return localISO(d);
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export interface StayParams {
  checkIn: string;       // '' when absent / invalid
  checkOut: string;      // '' when absent / invalid
  guests: number | null; // null when absent
  rooms: number | null;  // null when absent
}

/** Reads and validates the stay from a query string such as window.location.search. */
export function parseStayParams(search: string): StayParams {
  const sp = new URLSearchParams(search);
  const today = localISO(new Date());

  let checkIn = sp.get('checkIn') ?? '';
  let checkOut = sp.get('checkOut') ?? '';
  if (!ISO_DATE.test(checkIn) || checkIn < today) { checkIn = ''; }
  if (!ISO_DATE.test(checkOut) || !checkIn || checkOut <= checkIn) { checkOut = ''; }

  const num = (key: string, max: number): number | null => {
    const raw = sp.get(key);
    if (raw === null || !/^\d{1,3}$/.test(raw)) { return null; }
    return clamp(Number(raw), 1, max);
  };

  return { checkIn, checkOut, guests: num('guests', MAX_GUESTS), rooms: num('rooms', MAX_ROOMS) };
}

/** Builds "checkIn=..&checkOut=..&guests=..&rooms=.." (only the parts that are set). */
export function stayQuery(p: Partial<StayParams>): string {
  const sp = new URLSearchParams();
  if (p.checkIn) { sp.set('checkIn', p.checkIn); }
  if (p.checkOut) { sp.set('checkOut', p.checkOut); }
  if (p.guests) { sp.set('guests', String(p.guests)); }
  if (p.rooms) { sp.set('rooms', String(p.rooms)); }
  return sp.toString();
}
