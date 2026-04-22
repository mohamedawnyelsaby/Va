/* ============================================================
   PATH: app/[locale]/hotels/page.tsx
   ============================================================ */

'use client';

import { useState } from 'react';
import styles from './page.module.css';

interface Hotel {
  id: string;
  name: string;
  location: string;
  stars: number;
  rating: number;
  reviews: number;
  price: number;
  currency: string;
  tag?: string;
  emoji: string;
}

const MOCK_HOTELS: Hotel[] = [
  { id: '1', name: 'Four Seasons Cairo', location: 'Garden City, Cairo', stars: 5, rating: 9.2, reviews: 1840, price: 320, currency: 'USD', tag: 'TOP PICK', emoji: '🏙️' },
  { id: '2', name: 'Kempinski Nile Hotel', location: 'Garden City, Cairo', stars: 5, rating: 8.9, reviews: 1230, price: 275, currency: 'USD', emoji: '🌊' },
  { id: '3', name: 'Marriott Mena House', location: 'Giza, Cairo', stars: 5, rating: 9.0, reviews: 2100, price: 295, currency: 'USD', tag: 'ICONIC', emoji: '🏛️' },
  { id: '4', name: 'Sheraton Cairo Hotel', location: 'Galaa Square, Cairo', stars: 4, rating: 8.4, reviews: 980, price: 150, currency: 'USD', emoji: '🌆' },
  { id: '5', name: 'Le Méridien Cairo', location: 'Airport Road, Cairo', stars: 4, rating: 8.1, reviews: 760, price: 130, currency: 'USD', tag: 'GREAT VALUE', emoji: '✈️' },
];

const FILTERS = ['All', 'Luxury', 'Budget', '5★', '4★', 'Pool', 'Breakfast'];

export default function HotelsPage({ params }: { params: { locale: string } }) {
  const locale = params?.locale ?? 'en';
  const isAr = locale === 'ar';
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'rating' | 'price'>('rating');

  const AR_FILTERS = ['الكل', 'فاخر', 'اقتصادي', '5★', '4★', 'حمام سباحة', 'إفطار'];

  const sorted = [...MOCK_HOTELS].sort((a, b) =>
    sortBy === 'rating' ? b.rating - a.rating : a.price - b.price
  );

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
            placeholder={isAr ? 'ابحث عن فندق أو مدينة...' : 'Search hotels or cities...'}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* ── Filters ── */}
      <div className={styles.filtersRow}>
        {(isAr ? AR_FILTERS : FILTERS).map((f, i) => (
          <button
            key={f}
            onClick={() => setActiveFilter(FILTERS[i])}
            className={`${styles.filterChip} ${activeFilter === FILTERS[i] ? styles.filterActive : ''}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── Sort Row ── */}
      <div className={styles.sortRow}>
        <span className="text-small muted">
          {sorted.length} {isAr ? 'نتيجة' : 'results'}
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

      {/* ── Hotel Cards ── */}
      <div className={styles.list}>
        {sorted.map((hotel, i) => (
          <div
            key={hotel.id}
            className={styles.hotelCard}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Image placeholder */}
            <div className={styles.hotelImg}>
              <span className={styles.hotelEmoji}>{hotel.emoji}</span>
              {hotel.tag && (
                <span className={styles.hotelTag}>{hotel.tag}</span>
              )}
            </div>

            {/* Info */}
            <div className={styles.hotelInfo}>
              <div className={styles.hotelTop}>
                <div>
                  <h3 className={styles.hotelName}>{hotel.name}</h3>
                  <p className={`text-small muted ${styles.hotelLoc}`}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    {hotel.location}
                  </p>
                </div>
                <div className={styles.hotelRating}>
                  <span className={styles.ratingNum}>{hotel.rating}</span>
                  <span className={styles.ratingLabel}>{isAr ? 'ممتاز' : 'Excellent'}</span>
                </div>
              </div>

              <div className={styles.hotelStars}>
                {'★'.repeat(hotel.stars)}{'☆'.repeat(5 - hotel.stars)}
                <span className={`text-small muted`}>({hotel.reviews.toLocaleString()})</span>
              </div>

              <div className={styles.hotelFooter}>
                <div className={styles.hotelPrice}>
                  <span className={styles.priceNum}>${hotel.price}</span>
                  <span className={`text-small muted`}>/ {isAr ? 'ليلة' : 'night'}</span>
                </div>
                <button className={`btn btn-primary ${styles.bookBtn}`}>
                  {isAr ? 'احجز الآن' : 'Book Now'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: '100px' }} />
    </main>
  );
}
