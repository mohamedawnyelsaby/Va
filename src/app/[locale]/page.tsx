/* ============================================================
   PATH: app/[locale]/page.tsx
   Va Travel — Homepage matching the reference app design exactly
   ============================================================ */
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { AIFeatureCards } from '@/components/sections/ai-feature-cards';
import { Phase2Features } from '@/components/sections/phase2-features';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n/translations';
import CounterRow from '@/components/ui/CounterRow';
import { MAX_GUESTS, MAX_ROOMS, clamp, localISO, addDays, stayQuery } from '@/lib/stay';

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

/* Small words the search box needs in every language, plus the question that the
 * "Search with AI" button sends to the assistant. */
interface SearchWords {
  checkIn: string; checkOut: string; adults: string; rooms: string; done: string;
  ai: (dest: string, dates: string, guests: number, rooms: number) => string;
}
const SEARCH_WORDS: Record<string, SearchWords> = {
  en: { checkIn: 'Check-in', checkOut: 'Check-out', adults: 'Adults', rooms: 'Rooms', done: 'Done',
    ai: (d, dt, g, r) => d ? `Plan a trip to ${d}${dt} for ${g} guests, ${r} room(s). Suggest the best hotels and activities.` : `Suggest the best destinations and hotels${dt} for ${g} guests, ${r} room(s).` },
  ar: { checkIn: 'الوصول', checkOut: 'المغادرة', adults: 'بالغين', rooms: 'غرف', done: 'تم',
    ai: (d, dt, g, r) => d ? `خطط لي رحلة إلى ${d}${dt} لعدد ${g} أفراد و${r} غرفة. اقترح أفضل الفنادق والأنشطة.` : `اقترح لي أفضل الوجهات والفنادق${dt} لعدد ${g} أفراد و${r} غرفة.` },
  fr: { checkIn: 'Arrivée', checkOut: 'Départ', adults: 'Adultes', rooms: 'Chambres', done: 'OK',
    ai: (d, dt, g, r) => d ? `Planifie un voyage à ${d}${dt} pour ${g} personnes, ${r} chambre(s). Propose les meilleurs hôtels et activités.` : `Propose les meilleures destinations et hôtels${dt} pour ${g} personnes, ${r} chambre(s).` },
  es: { checkIn: 'Entrada', checkOut: 'Salida', adults: 'Adultos', rooms: 'Habitaciones', done: 'Listo',
    ai: (d, dt, g, r) => d ? `Planifica un viaje a ${d}${dt} para ${g} personas, ${r} habitación(es). Sugiere los mejores hoteles y actividades.` : `Sugiere los mejores destinos y hoteles${dt} para ${g} personas, ${r} habitación(es).` },
  de: { checkIn: 'Anreise', checkOut: 'Abreise', adults: 'Erwachsene', rooms: 'Zimmer', done: 'Fertig',
    ai: (d, dt, g, r) => d ? `Plane eine Reise nach ${d}${dt} für ${g} Personen, ${r} Zimmer. Empfiehl die besten Hotels und Aktivitäten.` : `Empfiehl die besten Reiseziele und Hotels${dt} für ${g} Personen, ${r} Zimmer.` },
  ru: { checkIn: 'Заезд', checkOut: 'Выезд', adults: 'Взрослые', rooms: 'Номера', done: 'Готово',
    ai: (d, dt, g, r) => d ? `Спланируй поездку в ${d}${dt} для ${g} гостей, номеров: ${r}. Предложи лучшие отели и занятия.` : `Предложи лучшие направления и отели${dt} для ${g} гостей, номеров: ${r}.` },
  zh: { checkIn: '入住', checkOut: '退房', adults: '成人', rooms: '客房', done: '完成',
    ai: (d, dt, g, r) => d ? `为${g}位客人、${r}间客房规划前往${d}的旅行${dt}。推荐最好的酒店和活动。` : `为${g}位客人、${r}间客房推荐最佳目的地和酒店${dt}。` },
  ja: { checkIn: 'チェックイン', checkOut: 'チェックアウト', adults: '大人', rooms: '客室', done: '完了',
    ai: (d, dt, g, r) => d ? `${g}名・${r}部屋で${d}への旅行${dt}を計画してください。おすすめのホテルとアクティビティを教えてください。` : `${g}名・${r}部屋におすすめの目的地とホテル${dt}を教えてください。` },
};

export default function HomePage({ params }: Props) {
  const { locale } = use(params);
  const ar = isAr(locale);
  const tr = t(locale);
  const h = tr.home;
  const router = useRouter();
  const w = SEARCH_WORDS[locale] ?? SEARCH_WORDS.en;
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
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const today = localISO(new Date());

  const onCheckIn = (v: string) => {
    setCheckIn(v);
    if (checkOut && v && checkOut <= v) { setCheckOut(''); }
  };
  const onGuests = (g: number) => {
    const next = clamp(g, 1, MAX_GUESTS);
    setGuests(next);
    if (rooms > next) { setRooms(next); } // never more rooms than guests
  };
  const onRooms = (r: number) => setRooms(clamp(r, 1, Math.min(MAX_ROOMS, guests)));

  const goHotels = () => {
    const sp = new URLSearchParams(stayQuery({ checkIn, checkOut, guests, rooms }));
    if (query.trim()) { sp.set('q', query.trim()); }
    router.push(`/${locale}/hotels?${sp.toString()}`);
  };
  const goAI = () => {
    const dates = checkIn && checkOut ? ` (${checkIn} → ${checkOut})` : '';
    router.push(`/${locale}/ai?q=${encodeURIComponent(w.ai(query.trim(), dates, guests, rooms))}`);
  };

  // Only Hotels exists today; the other tabs are announced, not clickable.
  const TABS = [
    { id: 'hotels', icon: '🏨', label: h.tabHotels, soon: false },
    { id: 'flights', icon: '✈️', label: h.tabFlights, soon: true },
    { id: 'pkgs', icon: '🎁', label: h.tabPackages, soon: true },
    { id: 'visa', icon: '🛂', label: h.tabVisa, soon: true },
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
            <div className={styles.stabs} role="tablist">
              {TABS.map((tItem) => (
                <button
                  key={tItem.id}
                  type="button"
                  role="tab"
                  aria-selected={!tItem.soon}
                  disabled={tItem.soon}
                  aria-disabled={tItem.soon}
                  className={`${styles.stab} ${!tItem.soon ? styles.on : ''}`}
                  style={tItem.soon ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}
                >
                  {tItem.icon} {tItem.label}
                  {tItem.soon && <span className={styles.soonBadge}>{h.soon}</span>}
                </button>
              ))}
            </div>
            <div className={styles.sbody}>
              <label className={styles.sfield}>
                <span aria-hidden>📍</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className={styles.sfieldLbl}>{h.destinationLabel}</div>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); goHotels(); } }}
                    placeholder={h.destinationPlaceholder}
                    enterKeyHint="search"
                    autoComplete="off"
                    maxLength={100}
                  />
                </div>
              </label>
              <div className={styles.sgrid2}>
                <label className={styles.sfield}>
                  <span aria-hidden>📅</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className={styles.sfieldLbl}>{w.checkIn}</div>
                    <input type="date" lang={locale} min={today} value={checkIn} onChange={(e) => onCheckIn(e.target.value)} aria-label={w.checkIn} />
                  </div>
                </label>
                <label className={styles.sfield}>
                  <span aria-hidden>📅</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className={styles.sfieldLbl}>{w.checkOut}</div>
                    <input type="date" lang={locale} min={addDays(checkIn || today, 1)} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} aria-label={w.checkOut} />
                  </div>
                </label>
              </div>
              <button
                type="button"
                className={styles.sfield}
                onClick={() => setGuestsOpen((o) => !o)}
                aria-expanded={guestsOpen}
                style={{ width: '100%', textAlign: 'start', font: 'inherit', color: 'inherit' }}
              >
                <span aria-hidden>👥</span>
                <div style={{ flex: 1 }}>
                  <div className={styles.sfieldLbl}>{h.guestsLabel}</div>
                  <div style={{ fontSize: '.85rem', color: 'var(--t)' }}>{guests} {w.adults} · {rooms} {w.rooms}</div>
                </div>
                <span aria-hidden style={{ color: 'var(--tm)', transition: '.18s', transform: guestsOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
              </button>
              {guestsOpen && (
                <div style={{ background: 'var(--s2)', borderRadius: 'var(--rM)', padding: '6px 14px 10px' }}>
                  <CounterRow label={w.adults} value={guests} min={1} max={MAX_GUESTS} onChange={onGuests} />
                  <CounterRow label={w.rooms} value={rooms} min={1} max={Math.min(MAX_ROOMS, guests)} onChange={onRooms} />
                  <button
                    type="button"
                    onClick={() => setGuestsOpen(false)}
                    style={{ marginTop: '6px', width: '100%', minHeight: '44px', borderRadius: 'var(--rM)', border: '1px solid var(--bd)', background: 'transparent', color: 'var(--g)', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}
                  >
                    {w.done}
                  </button>
                </div>
              )}
              <div style={{ display: 'flex', gap: '9px', flexWrap: 'wrap' }}>
                <button type="button" className={styles.sbtn} onClick={goHotels} style={{ flex: '1 1 150px', width: 'auto' }}>
                  🔍 {tr.hero.search}
                </button>
                <button
                  type="button"
                  className={styles.sbtn}
                  onClick={goAI}
                  style={{ flex: '1 1 150px', width: 'auto', background: 'transparent', color: 'var(--g)', border: '1px solid var(--g)' }}
                >
                  ✨ {h.searchBtn}
                </button>
              </div>
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
