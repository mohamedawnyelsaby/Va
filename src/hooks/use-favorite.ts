'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

export type FavoriteItemType = 'hotel' | 'attraction' | 'restaurant';

/**
 * Favoriting an item, backed by the real /api/favorites endpoint (the
 * Favorite table). Previously each detail page kept its own localStorage
 * list under a different key than the /favorites page read from, so
 * "saving" a hotel never actually showed up anywhere. This is the one
 * shared implementation all three detail pages use.
 *
 * Favoriting requires a signed-in account (it's tied to the user's row in
 * the database, same as bookings/reviews) — a logged-out click redirects
 * to sign-in instead of silently no-op'ing.
 */
export function useFavorite(itemId: string | undefined, itemType: FavoriteItemType) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [isFavorited, setIsFavorited] = useState(false);
  const [checked, setChecked] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!itemId || status !== 'authenticated') {
      setChecked(true);
      return;
    }
    let cancelled = false;
    fetch(`/api/favorites?itemId=${encodeURIComponent(itemId)}&itemType=${itemType}`)
      .then((r) => (r.ok ? r.json() : { isFavorited: false }))
      .then((data) => { if (!cancelled) {setIsFavorited(!!data.isFavorited);} })
      .catch(() => {})
      .finally(() => { if (!cancelled) {setChecked(true);} });
    return () => { cancelled = true; };
  }, [itemId, itemType, status]);

  const toggle = useCallback(async (): Promise<{ ok: boolean; requiresAuth?: boolean; favorited?: boolean }> => {
    if (!itemId) {return { ok: false };}

    if (status !== 'authenticated') {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(pathname || '/')}`);
      return { ok: false, requiresAuth: true };
    }

    setPending(true);
    const next = !isFavorited;
    try {
      const res = await fetch('/api/favorites', {
        method: next ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, itemType }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/auth/signin?callbackUrl=${encodeURIComponent(pathname || '/')}`);
          return { ok: false, requiresAuth: true };
        }
        return { ok: false };
      }
      setIsFavorited(next);
      return { ok: true, favorited: next };
    } catch {
      return { ok: false };
    } finally {
      setPending(false);
    }
  }, [itemId, itemType, isFavorited, status, router, pathname]);

  return { isFavorited, checked, pending, toggle };
}
