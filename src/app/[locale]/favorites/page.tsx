'use client';
// PATH: src/app/[locale]/favorites/page.tsx
//
// FIX: this page used to read from `useWishlist()` (localStorage key
// `va_wishlist`), which only ever held a fixed list of 6 fictional
// "destination" cards (lib/wishlist.ts DESTINATIONS) — completely
// disconnected from the heart buttons on the actual hotel/attraction/
// restaurant pages (those wrote to a different, unrelated localStorage
// key and were never read back anywhere). A user could favorite a real
// hotel, get a "Saved to favorites" toast, and never see it again here.
// Now backed by the real /api/favorites endpoint (the Favorite table),
// the same one those heart buttons now use.

import Link from 'next/link';
import Image from 'next/image';
import { use, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';
import { t } from '@/lib/i18n/translations';

interface Props {
  params: Promise<{ locale: string }>;
}

interface FavoriteItem {
  favoriteId: string;
  itemId: string;
  itemType: 'hotel' | 'attraction' | 'restaurant';
  name: string;
  city: string;
  country: string;
  thumbnail?: string | null;
  rating?: number | null;
  price?: number | null;
  currency?: string | null;
  priceRange?: string | null;
}

const isAr = (locale: string) => locale === 'ar';

const ITEM_PATH: Record<FavoriteItem['itemType'], string> = {
  hotel: 'hotels',
  attraction: 'attractions',
  restaurant: 'restaurants',
};

export default function FavoritesPage({ params }: Props) {
  const { locale } = use(params);
  const ar = isAr(locale);
  const tr = t(locale);
  const f = tr.favorites;
  const { status } = useSession();

  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    if (status !== 'authenticated') {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/favorites?limit=50');
      const data = await res.json();
      setItems(data.favorites || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const remove = async (item: FavoriteItem) => {
    setRemovingId(item.favoriteId);
    try {
      await fetch('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.itemId, itemType: item.itemType }),
      });
      setItems((prev) => prev.filter((x) => x.favoriteId !== item.favoriteId));
    } catch {
      // best-effort; the item just stays in the list if this fails
    } finally {
      setRemovingId(null);
    }
  };

  const showSignInPrompt = status === 'unauthenticated';

  return (
    <main className={styles.main} dir={ar ? 'rtl' : 'ltr'}>
      <div className={styles.sh}>
        <div className={styles.st}>❤️ {tr.profile.menuSaved}</div>
      </div>

      <div className={styles.dg}>
        {loading ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIco}>⏳</div>
            <div className={styles.emptyTitle}>{ar ? 'جاري التحميل...' : 'Loading...'}</div>
          </div>
        ) : showSignInPrompt ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIco}>🔒</div>
            <div className={styles.emptyTitle}>{ar ? 'سجّل الدخول لرؤية مفضلتك' : 'Sign in to see your favorites'}</div>
            <div className={styles.emptySub}>
              {ar ? 'المفضلة مرتبطة بحسابك حتى تظهر لك على أي جهاز.' : 'Favorites are tied to your account so they follow you across devices.'}
            </div>
            <Link href={`/${locale}/auth/signin?callbackUrl=${encodeURIComponent(`/${locale}/favorites`)}`} className={styles.emptyBtn}>
              {ar ? 'تسجيل الدخول' : 'Sign In'}
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIco}>🗺️</div>
            <div className={styles.emptyTitle}>{f.emptyTitle}</div>
            <div className={styles.emptySub}>
              {f.emptySub}
            </div>
            <Link href={`/${locale}`} className={styles.emptyBtn}>
              {f.emptyBtn}
            </Link>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.favoriteId} className={styles.dc}>
              {item.thumbnail ? (
                <Image src={item.thumbnail} alt={item.name} fill sizes="(max-width: 768px) 50vw, 300px" loading="lazy" />
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', background: 'var(--bg-subtle, #1a1a2e)' }}>
                  {item.itemType === 'hotel' ? '🏨' : item.itemType === 'restaurant' ? '🍽️' : '🎟️'}
                </div>
              )}
              <button
                className={styles.wbtn}
                onClick={() => remove(item)}
                disabled={removingId === item.favoriteId}
                aria-label={f.removeSaved}
              >
                ❤️
              </button>
              <Link href={`/${locale}/${ITEM_PATH[item.itemType]}/${item.itemId}`} className={styles.di} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={styles.dn}>{item.name}</div>
                <div className={styles.dc2}>{item.city}{item.country ? `, ${item.country}` : ''}</div>
                {item.priceRange ? (
                  <div className={styles.dp}>{item.priceRange}</div>
                ) : item.price !== null && item.price !== undefined ? (
                  <div className={styles.dp}>
                    {item.currency === 'USD' ? '$' : item.currency === 'EUR' ? '€' : (item.currency || '')}{item.price}
                    {item.itemType === 'hotel' ? tr.home.perNight : ''}
                  </div>
                ) : null}
              </Link>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
