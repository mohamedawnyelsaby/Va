'use client';
// PATH: src/lib/wishlist.ts
// Shared "saved destinations" state — backed by localStorage so it
// survives reloads, and kept in sync across components via a custom
// window event (no extra state-management library needed).

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'va_wishlist';
const EVENT_NAME = 'va-wishlist-changed';

export interface Destination {
  id: number;
  nameAr: string;
  nameEn: string;
  countryAr: string;
  countryEn: string;
  price: number;
  img: string;
  weather: string;
  badge: string;
}

export const DESTINATIONS: Destination[] = [
  { id: 1, nameAr: 'دبي', nameEn: 'Dubai', countryAr: 'الإمارات', countryEn: 'UAE', price: 840, img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600', weather: '☀️ 35°C', badge: '🔥' },
  { id: 2, nameAr: 'طوكيو', nameEn: 'Tokyo', countryAr: 'اليابان', countryEn: 'Japan', price: 650, img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600', weather: '🌸 22°C', badge: '🌟' },
  { id: 3, nameAr: 'باريس', nameEn: 'Paris', countryAr: 'فرنسا', countryEn: 'France', price: 720, img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600', weather: '⛅ 18°C', badge: '' },
  { id: 4, nameAr: 'المالديف', nameEn: 'Maldives', countryAr: 'المالديف', countryEn: 'Maldives', price: 1200, img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600', weather: '🌊 29°C', badge: '💎' },
  { id: 5, nameAr: 'بالي', nameEn: 'Bali', countryAr: 'إندونيسيا', countryEn: 'Indonesia', price: 420, img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600', weather: '🌴 27°C', badge: '' },
  { id: 6, nameAr: 'سانتوريني', nameEn: 'Santorini', countryAr: 'اليونان', countryEn: 'Greece', price: 590, img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600', weather: '🌞 24°C', badge: '' },
];

function readStored(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeStored(ids: number[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: ids }));
  } catch {
    /* localStorage unavailable (private mode etc.) — fail silently */
  }
}

/** Shared saved-destinations state. Starts empty on the server render
 * (avoids hydration mismatch) then syncs from localStorage on mount. */
export function useWishlist() {
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    setIds(readStored());
    const onChange = (e: Event) => setIds((e as CustomEvent<number[]>).detail);
    window.addEventListener(EVENT_NAME, onChange as EventListener);
    return () => window.removeEventListener(EVENT_NAME, onChange as EventListener);
  }, []);

  const toggle = useCallback((id: number) => {
    setIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      writeStored(next);
      return next;
    });
  }, []);

  return { ids, toggle };
}
