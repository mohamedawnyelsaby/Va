/* ============================================================
   PATH: app/[locale]/page.tsx
   Va Travel — Homepage matching the reference app design exactly
   ============================================================ */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { AIFeatureCards } from '@/components/sections/ai-feature-cards';
import { Phase2Features } from '@/components/sections/phase2-features';
import { useWishlist, DESTINATIONS } from '@/lib/wishlist';
import { t } from '@/lib/i18n/translations';

interface Props {
  params: { locale: string };
}

const isAr = (locale: string) => locale === 'ar';

// Flash deal destination names and review content are still bilingual
// (ar/en) pending full 8-language translation in a follow-up pass.
const FLASH = [
  { destAr: 'دبي', destEn: 'Dubai', off: '35%', price: 546, orig: 840, flag: '🇦🇪' },
  { destAr: 'بالي', destEn: 'Bali', off: '40%', price: 252, orig: 420, flag: '🇮🇩' },
  { destAr: 'روما', destEn: 'Rome', off: '25%', price: 510, orig: 680, flag: '🇮🇹' },
  { destAr: 'بانكوك', destEn: 'Bangkok', off: '50%', price: 180, orig: 360, flag: '🇹🇭' },
  { destAr: 'سنغافورة', destEn: 'Singapore', off: '30%', price: 420, orig: 600, flag: '🇸🇬' },
];

const HOTELS = [
  { id: 1, name: 'Burj Al Arab', stars: 5, loc: 'Dubai, UAE', price: 840, orig: 980, score: 9.8, tags: ['Sea View', 'Butler', 'Pool'], priceDrop: true, img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600' },
  { id: 2, name: 'Four Seasons Bora Bora', stars: 5, loc: 'French Polynesia', price: 1200, score: 9.9, tags: ['Overwater', 'Snorkel', 'Spa'], priceDrop: false, img: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600' },
  { id: 3, name: 'The Peninsula Tokyo', stars: 5, loc: 'Tokyo, Japan', price: 650, orig: 750, score: 9.7, tags: ['City View', 'Fine Dining', 'Spa'], priceDrop: true, img: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600' },
  { id: 4, name: 'Hotel de Russie', stars: 5, loc: 'Rome, Italy', price: 680, score: 9.6, tags: ['Garden', 'Spa', 'Trattoria'], priceDrop: false, img: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600' },
];

const RATES = [
  { flag: '💵→π', from: '1 USD', to: 'π', value: '2.52', unit: 'π', up: true },
  { flag: '🇪🇬→π', from: '1 π', to: 'EGP', value: '19.48', unit: 'EGP', up: false },
  { flag: '💵→🇪🇬', from: '1 USD', to: 'EGP', value: '48.81', unit: 'EGP', up: true },
];

const REVIEWS = [
  {
    stars: 5,
    textAr: '"خدمة لا تصدق! حجزت فندق في دبي في دقائق والذكاء الاصطناعي اقترح لي ترقية مجانية."',
    textEn: '"Incredible service! Booked in Dubai in minutes, the AI suggested a free upgrade."',
    name: 'Ahmed Al-Saeed', destAr: 'دبي 🇦🇪', destEn: 'Dubai 🇦🇪', ava: '🧑‍💼',
  },
  {
    stars: 5,
    textAr: '"Logy خطط لي رحلة يابان كاملة في ثوانٍ. أفضل تطبيق سفر جربته."',
    textEn: '"Logy planned my entire Japan trip in seconds. Best travel app I\'ve ever used."',
    name: 'Sarah Al-Mahdi', destAr: 'طوكيو 🇯🇵', destEn: 'Tokyo 🇯🇵', ava: '👩‍💻',
  },
  {
    stars: 5,
    textAr: '"فحص التأشيرة وفّر عليّ ساعات من البحث. واضح ودقيق."',
    textEn: '"The visa checker saved me hours of research. Clear and accurate."',
    name: 'Karim Boulaaras', destAr: 'باريس 🇫🇷', destEn: 'Paris 🇫🇷', ava: '👨‍🎨',
  },
  {
    stars: 5,
    textAr: '"أسعار الصرف اللحظية والتوقعات ساعدتني أوفر 30% على رحلتي."',
    textEn: '"Live exchange rates and predictions helped me save 30% on my trip."',
    name: 'Layla Nasr', destAr: 'المالديف 🇲🇻', destEn: 'Maldives 🇲🇻', ava: '👩‍🦱',
  },
];

function fp(price: number) {
  return `$${Math.round(price)}`;
}

export default function HomePage({ params: { locale } }: Props) {
  const ar = isAr(locale);
  const tr = t(locale);
  const h = tr.home;
  const [tab, setTab] = useState('hotels');
  const [activeCat, setActiveCat] = useState(0);
  const { ids: wishlist, toggle: toggleWish } = useWishlist();
  const [query, setQuery] = useState('');

  const TABS = [
    { id: 'hotels', icon: '🏨', label: h.tabHotels },
    { id: 'flights', icon: '✈️', label: h.tabFlights, soon: true },
    { id: 'pkgs', icon: '🎁', label: h.tabPackages },
    { id: 'visa', icon: '🛂', label: h.tabVisa },
  ];

  return (
    <main className={styles.main} dir={ar ? 'rtl' : 'ltr'}>

      {/* ── Ticker ── */}
      <div className={styles.ticker}>
        <div className={styles.tickerInner}>
          {[...h.ticker, ...h.ticker].map((item, i) => (
            <span key={i} className={styles.tickerItem} dangerouslySetInnerHTML={{ __html: `•&nbsp;${item}` }} />
          ))}
        </div>
      </div>

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
            <div><div className={styles.statNum}><span>180</span>+</div><div className={styles.statLabel}>{h.statDestinations}</div></div>
            <div><div className={styles.statNum}><span>42</span>K</div><div className={styles.statLabel}>{h.statHotels}</div></div>
            <div><div className={styles.statNum}><span>8</span>M</div><div className={styles.statLabel}>{h.statTravelers}</div></div>
            <div><div className={styles.statNum}><span>6</span></div><div className={styles.statLabel}>{h.statLanguages}</div></div>
          </div>

          {/* Search widget */}
          <div className={styles.sw}>
            <div className={styles.stabs}>
              {TABS.map((tItem) => (
                <button
                  key={tItem.id}
                  className={`${styles.stab} ${tab === tItem.id ? styles.on : ''}`}
                  onClick={() => setTab(tItem.id)}
                >
                  {tItem.icon} {tItem.label}
                  {tItem.soon && <span className={styles.soonBadge}>{h.soon}</span>}
                </button>
              ))}
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

      {/* ── Flash Deals ── */}
      <div className={styles.flash}>
        <div className={styles.flLbl}>
          <div className={styles.flFire}>🔥</div>
          <div className={styles.flLabel}>{h.flashDeals}</div>
        </div>
        <div className={styles.flDeals}>
          {FLASH.map((d) => (
            <div key={d.destEn} className={styles.fdeal}>
              <div className={styles.fdest}>{d.flag} {ar ? d.destAr : d.destEn}</div>
              <div className={styles.foff}>-{d.off}</div>
              <div><span className={styles.fprice}>{fp(d.price)}</span><span className={styles.forig}>{fp(d.orig)}</span></div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Categories ── */}
      <div className={styles.cats}>
        {h.categories.map((c, i) => (
          <button key={c} className={`${styles.cat} ${i === activeCat ? styles.on : ''}`} onClick={() => setActiveCat(i)}>
            {c}
          </button>
        ))}
      </div>

      {/* ── Live Exchange Rates ── */}
      <div className={styles.sh}>
        <div className={styles.st}>💱 {h.exchangeRates}</div>
      </div>
      <div className={styles.ratesRow}>
        {RATES.map((r) => (
          <div key={r.from + r.to} className={styles.ratePill}>
            {r.flag} {r.from} = <span className={r.up ? styles.rateUp : styles.rateDown}>{r.value} {r.unit} {r.up ? '↑' : '↓'}</span>
          </div>
        ))}
      </div>

      {/* ── Destinations ── */}
      <div className={styles.sh}>
        <div className={styles.st}>🌍 {h.popularDestinations}</div>
        <Link href={`/${locale}/attractions`} className={styles.sl}>{h.viewAll}</Link>
      </div>
      <div className={styles.dg}>
        {DESTINATIONS.map((d) => (
          <Link key={d.id} href={`/${locale}/attractions`} className={styles.dc}>
            {d.badge && <div className={styles.dBadge}>{d.badge}</div>}
            <img src={d.img} alt={ar ? d.nameAr : d.nameEn} loading="lazy" />
            <button
              className={`${styles.wbtn} ${wishlist.includes(d.id) ? styles.on : ''}`}
              onClick={(e) => { e.preventDefault(); toggleWish(d.id); }}
            >
              {wishlist.includes(d.id) ? '❤️' : '🤍'}
            </button>
            <div className={styles.di}>
              <div className={styles.dn}>{ar ? d.nameAr : d.nameEn}</div>
              <div className={styles.dc2}>{ar ? d.countryAr : d.countryEn} · {d.weather}</div>
              <div className={styles.dp}>{h.fromPrefix}{fp(d.price)}{h.perNight}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Hotels ── */}
      <div className={styles.sh}>
        <div className={styles.st}>🏆 {h.topHotels}</div>
        <Link href={`/${locale}/hotels`} className={styles.sl}>{h.viewAll}</Link>
      </div>
      <div className={styles.hs}>
        {HOTELS.map((hotel) => (
          <div key={hotel.id} className={styles.hc}>
            {hotel.priceDrop && <div className={styles.pdrop}>📉 {h.priceDrop}</div>}
            <img className={styles.hcImg} src={hotel.img} alt={hotel.name} loading="lazy" />
            <div className={styles.hbody}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className={styles.hname}>{hotel.name}</div>
                  <div className={styles.hstars}>{'★'.repeat(hotel.stars)}</div>
                  <div className={styles.hloc}>📍 {hotel.loc}</div>
                </div>
                <div style={{ textAlign: 'end' }}>
                  <div className={styles.hprice}>{fp(hotel.price)}<span style={{ fontSize: '.53rem' }}>{h.perNight}</span></div>
                  {hotel.orig && <div className={styles.horig}>{fp(hotel.orig)}</div>}
                </div>
              </div>
              <div className={styles.brow}>
                <span className={`${styles.b} ${styles.bg}`}>✓ {h.freeCancel}</span>
                <span className={`${styles.b} ${styles.bb}`}>✓ {h.instantConfirm}</span>
                <span className={`${styles.b} ${styles.ba}`}>🏆</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, margin: '5px 0' }}>
                {hotel.tags.map((tag) => (
                  <span key={tag} className={styles.b} style={{ background: 'var(--s2)', color: 'var(--td)' }}>{tag}</span>
                ))}
              </div>
              <div className={styles.hf}>
                <div className={styles.hscore}>⭐ {hotel.score}</div>
                <Link href={`/${locale}/hotels`} className={styles.bookBtn}>{h.bookNow}</Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Traveler Reviews ── */}
      <div className={styles.sh}>
        <div className={styles.st}>⭐ {h.travelerReviews}</div>
        <span className={styles.sl}>{h.more}</span>
      </div>
      <div className={styles.reviewsScroll}>
        {REVIEWS.map((r) => (
          <div key={r.name} className={styles.reviewCard}>
            <div className={styles.reviewQuote}>&rdquo;</div>
            <div className={styles.reviewStars}>{'★'.repeat(r.stars)}</div>
            <div className={styles.reviewText}>{ar ? r.textAr : r.textEn}</div>
            <div className={styles.reviewAuthor}>
              <div className={styles.reviewAva}>{r.ava}</div>
              <div>
                <div className={styles.reviewName}>{r.name}</div>
                <div className={styles.reviewDest}>{ar ? r.destAr : r.destEn}</div>
              </div>
            </div>
          </div>
        ))}
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
