/* ============================================================
   PATH: app/[locale]/hotels/page.tsx
   ============================================================ */

'use client';

import { useState, useEffect, useCallback, useRef, use } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

interface ApiHotel {
  id: string;
  name: string;
  city: string;
  country: string;
  starRating: number;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  currency: string;
  thumbnail?: string | null;
  isFeatured?: boolean;
  discountRate?: number;
}

interface HotelsResponse {
  hotels: ApiHotel[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const STAR_FILTERS = [
  { label: 'All', ar: 'الكل', stars: 0 },
  { label: '5★', ar: '5★', stars: 5 },
  { label: '4★', ar: '4★', stars: 4 },
];

const CURRENCY_SYMBOL: Record<string, string> = { USD: '$', EUR: '€', AED: 'د.إ', GBP: '£' };

export default function HotelsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const isAr = locale === 'ar';

  const [hotels, setHotels] = useState<ApiHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [starFilter, setStarFilter] = useState(0);
  const [sortBy, setSortBy] = useState<'rating' | 'price'>('rating');

  // Debounce the search box so every keystroke doesn't fire a request.
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchAbort = useRef<AbortController | null>(null);

  const fetchHotels = useCallback(async () => {
    fetchAbort.current?.abort();
    const controller = new AbortController();
    fetchAbort.current = controller;

    setLoading(true);
    setError(false);
    try {
      const q = new URLSearchParams({
        page: String(page),
        limit: '12',
        sortBy: sortBy === 'rating' ? 'rating' : 'pricePerNight',
        order: sortBy === 'rating' ? 'desc' : 'asc',
      });
      if (search) {q.set('search', search);}
      if (starFilter > 0) {q.set('starRating', String(starFilter));}

      const res = await fetch(`/api/hotels?${q}`, { signal: controller.signal });
      if (!res.ok) {throw new Error('request failed');}
      const data: HotelsResponse = await res.json();
      setHotels(data.hotels || []);
      setTotal(data.pagination?.total ?? 0);
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {return;}
      setError(true);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, search, starFilter]);

  useEffect(() => { fetchHotels(); }, [fetchHotels]);

  const FILTERS_EN = STAR_FILTERS.map((f) => f.label);
  const FILTERS_AR = STAR_FILTERS.map((f) => f.ar);

  return (
    <main className={styles.main} dir={isAr ? 'rtl' : 'ltr'}>

      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <p className="text-label muted">{isAr ? 'اكتشف' : 'Discover'}</p>
          <h1 className={`text-h1 ${styles.pageTitle}`}>
            {isAr ? 'الفنادق' : 'Hotels'}
          </h1>
        </div>
        <button className={`${styles.mapBtn}`} aria-label="Map view">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
            <line x1="8" y1="2" x2="8" y2="18"/>
            <line x1="16" y1="6" x2="16" y2="22"/>
          </svg>
          {isAr ? 'الخريطة' : 'Map'}
        </button>
      </div>

      {/* ── Search Bar ── */}
      <div className={styles.searchWrap}>
        <div className={styles.searchBox}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.searchIcon}>
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={isAr ? 'ابحث عن فندق أو مدينة...' : 'Search hotels or cities...'}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* ── Filters ── */}
      <div className={styles.filtersRow}>
        {(isAr ? FILTERS_AR : FILTERS_EN).map((label, i) => (
          <button
            key={STAR_FILTERS[i].label}
            onClick={() => { setStarFilter(STAR_FILTERS[i].stars); setPage(1); }}
            className={`${styles.filterChip} ${starFilter === STAR_FILTERS[i].stars ? styles.filterActive : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Sort Row ── */}
      <div className={styles.sortRow}>
        <span className="text-small muted">
          {loading ? '...' : `${total} ${isAr ? 'نتيجة' : 'results'}`}
        </span>
        <div className={styles.sortBtns}>
          <button
            onClick={() => setSortBy('rating')}
            className={`${styles.sortBtn} ${sortBy === 'rating' ? styles.sortActive : ''}`}
          >
            {isAr ? 'التقييم' : 'Rating'}
          </button>
          <button
            onClick={() => setSortBy('price')}
            className={`${styles.sortBtn} ${sortBy === 'price' ? styles.sortActive : ''}`}
          >
            {isAr ? 'السعر' : 'Price'}
          </button>
        </div>
      </div>

      {/* ── States ── */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          {isAr ? 'جاري التحميل...' : 'Loading hotels...'}
        </div>
      )}

      {!loading && error && (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          {isAr ? 'حدث خطأ في تحميل الفنادق. حاول مرة أخرى.' : 'Could not load hotels. Please try again.'}
        </div>
      )}

      {!loading && !error && hotels.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          {isAr ? 'لا توجد فنادق مطابقة لبحثك.' : 'No hotels match your search.'}
        </div>
      )}

      {/* ── Hotel Cards ── */}
      {!loading && !error && hotels.length > 0 && (
        <div className={styles.list}>
          {hotels.map((hotel, i) => (
            <Link
              key={hotel.id}
              href={`/${locale}/hotels/${hotel.id}`}
              className={styles.hotelCard}
              style={{ animationDelay: `${i * 60}ms`, textDecoration: 'none', color: 'inherit' }}
            >
              <div className={styles.hotelImg}>
                {hotel.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={hotel.thumbnail}
                    alt={hotel.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span className={styles.hotelEmoji}>🏨</span>
                )}
                {hotel.isFeatured && (
                  <span className={styles.hotelTag}>{isAr ? 'مميز' : 'FEATURED'}</span>
                )}
              </div>

              <div className={styles.hotelInfo}>
                <div className={styles.hotelTop}>
                  <div>
                    <h3 className={styles.hotelName}>{hotel.name}</h3>
                    <p className={`text-small muted ${styles.hotelLoc}`}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      {hotel.city}{hotel.country ? `, ${hotel.country}` : ''}
                    </p>
                  </div>
                  <div className={styles.hotelRating}>
                    <span className={styles.ratingNum}>{hotel.rating?.toFixed(1) ?? '—'}</span>
                    <span className={styles.ratingLabel}>
                      {(hotel.rating ?? 0) >= 9 ? (isAr ? 'استثنائي' : 'Exceptional')
                        : (hotel.rating ?? 0) >= 8 ? (isAr ? 'ممتاز' : 'Excellent')
                        : (isAr ? 'جيد' : 'Good')}
                    </span>
                  </div>
                </div>

                <div className={styles.hotelStars}>
                  {'★'.repeat(hotel.starRating || 0)}{'☆'.repeat(5 - (hotel.starRating || 0))}
                  <span className="text-small muted">({(hotel.reviewCount ?? 0).toLocaleString()})</span>
                </div>

                <div className={styles.hotelFooter}>
                  <div className={styles.hotelPrice}>
                    <span className={styles.priceNum}>
                      {CURRENCY_SYMBOL[hotel.currency] ?? hotel.currency}{hotel.pricePerNight}
                    </span>
                    <span className="text-small muted"> / {isAr ? 'ليلة' : 'night'}</span>
                  </div>
                  <span className={`btn btn-primary ${styles.bookBtn}`}>
                    {isAr ? 'عرض التفاصيل' : 'View Details'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && !error && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', margin: '2rem 0' }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className={styles.sortBtn}
            style={{ opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
          >
            {isAr ? 'السابق' : 'Previous'}
          </button>
          <span className="text-small muted" style={{ alignSelf: 'center' }}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className={styles.sortBtn}
            style={{ opacity: page >= totalPages ? 0.4 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
          >
            {isAr ? 'التالي' : 'Next'}
          </button>
        </div>
      )}

      <div style={{ height: '100px' }} />
    </main>
  );
}
