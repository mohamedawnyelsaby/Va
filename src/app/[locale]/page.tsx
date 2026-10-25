/* ============================================================
   PATH: app/[locale]/page.tsx
   Va Travel — Homepage matching the reference app design exactly
   ============================================================ */
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import { AIFeatureCards } from '@/components/sections/ai-feature-cards';
import { Phase2Features } from '@/components/sections/phase2-features';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n/translations';

interface Props {
  params: Promise<{ locale: string }>;
}

const isAr = (locale: string) => locale === 'ar';

/* The home page used to render hard-coded sample content as if it were real:
 * flash deals with invented discounts, hotels that are not in the database
 * (and cannot be booked), made-up testimonials, "live" exchange rates that were
 * constants, and marketing totals ("42K hotels", "8M travelers"). It now shows
 * only what the API returns. */
interface HomeCity {
  id: string;
  name: string;
  country: string;
  thumbnail: string | null;
  images: string[];
  _count?: { hotels: number };
}
interface HomeHotel {
  id: string;
  name: string;
  city: string;
  starRating: number;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  currency: string;
  thumbnail: string | null;
  images: string[];
  amenities: string[];
}
interface HomeData {
  cities: HomeCity[];
  hotels: HomeHotel[];
  cityTotal: number;
  hotelTotal: number;
}

async function getJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) {throw new Error(`HTTP ${res.status}`);}
  return res.json() as Promise<T>;
}

export default function HomePage({ params }: Props) {
  const { locale } = use(params);
  const ar = isAr(locale);
  const tr = t(locale);
  const h = tr.home;
  const [tab, setTab] = useState('hotels');
  const [data, setData] = useState<HomeData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      getJson<{ cities: HomeCity[]; pagination?: { total?: number } }>('/api/cities?limit=6', controller.signal),
      getJson<{ hotels: HomeHotel[]; pagination?: { total?: number } }>('/api/hotels?limit=4&sortBy=rating', controller.signal),
    ])
      .then(([c, hs]) =>
        setData({
          cities: c.cities ?? [],
          hotels: hs.hotels ?? [],
          cityTotal: c.pagination?.total ?? (c.cities ?? []).length,
          hotelTotal: hs.pagination?.total ?? (hs.hotels ?? []).length,
        })
      )
      .catch((err) => {
        if (err?.name !== 'AbortError') {setFailed(true);}
      });
    return () => controller.abort();
  }, []);
  const [query, setQuery] = useState('');

  const TABS = [
    { id: 'hotels', icon: '🏨', label: h.tabHotels, href: `/${locale}/hotels` },
    { id: 'flights', icon: '✈️', label: h.tabFlights, soon: true },
    { id: 'pkgs', icon: '🎁', label: h.tabPackages },
    { id: 'visa', icon: '🛂', label: h.tabVisa },
  ];

  return (
    <main className={styles.main} dir={ar ? 'rtl' : 'ltr'}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroGrid} />
        <div className={styles.heroContent}>
          <div className={styles.htag}>
            <span>●</span> {h.badge}
          </div>
          <h1 className={styles.heroTitle}>
            {h.heroPart1Em ? <em>{h.heroPart1}</em> : h.heroPart1} {h.heroPart2Em ? <em>{h.heroPart2}</em> : h.heroPart2}<br />
            {h.heroPart3Em ? <em>{h.heroPart3}</em> : h.heroPart3} {h.heroPart4Em ? <em>{h.heroPart4}</em> : h.heroPart4}
          </h1>
          <p className={styles.heroSub}>
            {h.subtitle}
          </p>

          <div className={styles.stats}>
            <div><div className={styles.statNum}><span>{data ? data.cityTotal : '—'}</span></div><div className={styles.statLabel}>{h.statDestinations}</div></div>
            <div><div className={styles.statNum}><span>{data ? data.hotelTotal : '—'}</span></div><div className={styles.statLabel}>{h.statHotels}</div></div>
            <div><div className={styles.statNum}><span>8</span></div><div className={styles.statLabel}>{h.statLanguages}</div></div>
          </div>

          {/* Search widget */}
          <div className={styles.sw}>
            <div className={styles.stabs}>
              {TABS.map((tItem) => {
                const content = (
                  <>
                    {tItem.icon} {tItem.label}
                    {tItem.soon && <span className={styles.soonBadge}>{h.soon}</span>}
                  </>
                );
                return tItem.href ? (
                  <Link
                    key={tItem.id}
                    href={tItem.href}
                    className={`${styles.stab} ${tab === tItem.id ? styles.on : ''}`}
                    onClick={() => setTab(tItem.id)}
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    key={tItem.id}
                    className={`${styles.stab} ${tab === tItem.id ? styles.on : ''}`}
                    onClick={() => setTab(tItem.id)}
                  >
                    {content}
                  </button>
                );
              })}
            </div>
            <div className={styles.sbody}>
              <div className={styles.sfield}>
                <span>📍</span>
                <div style={{ flex: 1 }}>
                  <div className={styles.sfieldLbl}>{h.destinationLabel}</div>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={h.destinationPlaceholder}
                  />
                </div>
              </div>
              <div className={styles.sgrid2}>
                <div className={styles.sfield}>
                  <span>📅</span>
                  <div>
                    <div className={styles.sfieldLbl}>{h.datesLabel}</div>
                    <div style={{ fontSize: '.85rem', color: 'var(--tm)' }}>{h.selectDates}</div>
                  </div>
                </div>
                <div className={styles.sfield}>
                  <span>👥</span>
                  <div>
                    <div className={styles.sfieldLbl}>{h.guestsLabel}</div>
                    <div style={{ fontSize: '.85rem', color: 'var(--tm)' }}>{h.guestsValue}</div>
                  </div>
                </div>
              </div>
              <Link href={`/${locale}/hotels${query ? `?q=${encodeURIComponent(query)}` : ''}`} className={styles.sbtn}>
                🔍 {h.searchBtn}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Destinations (real cities) ── */}
      <div className={styles.sh}>
        <div className={styles.st}>🌍 {h.popularDestinations}</div>
        <Link href={`/${locale}/cities`} className={styles.sl}>{h.viewAll}</Link>
      </div>
      <div className={styles.dg}>
        {!data && !failed && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.dc} aria-hidden style={{ background: 'var(--s2)' }} />
        ))}
        {data?.cities.map((city) => {
          const img = city.thumbnail || city.images?.[0];
          return (
            <Link key={city.id} href={`/${locale}/hotels?city=${encodeURIComponent(city.name)}`} className={styles.dc}>
              {img && <Image src={img} alt={city.name} fill sizes="(max-width: 768px) 50vw, 300px" loading="lazy" />}
              <div className={styles.di}>
                <div className={styles.dn}>{city.name}</div>
                <div className={styles.dc2}>{city.country}</div>
                {city._count && <div className={styles.dp}>{city._count.hotels} {h.statHotels}</div>}
              </div>
            </Link>
          );
        })}
        {failed && <p style={{ gridColumn: '1 / -1', color: 'var(--td)', fontSize: '.85rem' }}>{ar ? 'تعذّر تحميل الوجهات. حاول مرة أخرى.' : 'Could not load destinations. Please try again.'}</p>}
      </div>

      {/* ── Hotels ── */}
      <div className={styles.sh}>
        <div className={styles.st}>🏆 {h.topHotels}</div>
        <Link href={`/${locale}/hotels`} className={styles.sl}>{h.viewAll}</Link>
      </div>
      <div className={styles.hs}>
        {!data && !failed && Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={styles.hc} aria-hidden style={{ height: 300, background: 'var(--s2)' }} />
        ))}
        {data?.hotels.map((hotel) => {
          const img = hotel.thumbnail || hotel.images?.[0];
          return (
            <div key={hotel.id} className={styles.hc}>
              <Link href={`/${locale}/hotels/${hotel.id}`} className={styles.hcImgWrap} style={{ display: 'block', background: 'var(--s2)' }}>
                {img && <Image className={styles.hcImg} src={img} alt={hotel.name} fill sizes="290px" loading="lazy" />}
              </Link>
              <div className={styles.hbody}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div>
                    <div className={styles.hname}>{hotel.name}</div>
                    <div className={styles.hstars}>{'★'.repeat(Math.max(0, Math.min(5, hotel.starRating)))}</div>
                    <div className={styles.hloc}>📍 {hotel.city}</div>
                  </div>
                  <div style={{ textAlign: 'end' }}>
                    <div className={styles.hprice}>{formatCurrency(hotel.pricePerNight, hotel.currency)}<span style={{ fontSize: '.53rem' }}>{h.perNight}</span></div>
                  </div>
                </div>
                {hotel.amenities?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, margin: '8px 0 5px' }}>
                    {hotel.amenities.slice(0, 3).map((tag) => (
                      <span key={tag} className={styles.b} style={{ background: 'var(--s2)', color: 'var(--td)' }}>{tag}</span>
                    ))}
                  </div>
                )}
                <div className={styles.hf}>
                  <div className={styles.hscore}>{hotel.reviewCount > 0 ? `⭐ ${hotel.rating.toFixed(1)}` : ''}</div>
                  <Link href={`/${locale}/hotels/${hotel.id}`} className={styles.bookBtn}>{h.bookNow}</Link>
                </div>
              </div>
            </div>
          );
        })}
        {failed && <p style={{ color: 'var(--td)', fontSize: '.85rem' }}>{ar ? 'تعذّر تحميل الفنادق. حاول مرة أخرى.' : 'Could not load hotels. Please try again.'}</p>}
      </div>

      {/* ── AI Features ── */}
      <div className={styles.sh}>
        <div className={styles.st}>🚀 {h.aiFeatures}</div>
      </div>
      <AIFeatureCards locale={locale} />

      {/* ── Phase 2 Features ── */}
      <div className={styles.sh}>
        <div className={styles.st}>🆕 {h.phase2Features}</div>
        <span className={styles.sl}>{h.exclusiveToVa}</span>
      </div>
      <Phase2Features locale={locale} />
    </main>
  );
}
