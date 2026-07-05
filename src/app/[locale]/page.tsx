/* ============================================================
   PATH: app/[locale]/page.tsx
   Va Travel — Homepage matching the reference app design exactly
   ============================================================ */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { AIFeatureCards } from '@/components/sections/ai-feature-cards';

interface Props {
  params: { locale: string };
}

const isAr = (locale: string) => locale === 'ar';

const TICKER_AR = [
  '✈️ أرخص رحلة لطوكيو اليوم: <strong>$420</strong> من القاهرة',
  '🏨 <strong>برج العرب</strong> دبي: خصم 35% هذا الأسبوع',
  '🌡️ طقس المالديف الآن: <strong>29°C ☀️</strong>',
  '🛂 تأشيرة تركيا مجانية لـ <strong>90 دولة</strong>',
  '💰 بالي 7 أيام بـ <strong>$1,200</strong> — أفضل عرض الشهر',
  '🌍 <strong>Va Travel</strong> متاح الآن في 180+ دولة',
];
const TICKER_EN = [
  '✈️ Cheapest Tokyo flight today: <strong>$420</strong> from Cairo',
  '🏨 <strong>Burj Al Arab</strong> Dubai: 35% off this week',
  '🌡️ Maldives now: <strong>29°C ☀️</strong> — perfect travel time',
  '🛂 Turkey visa-free for <strong>90 countries</strong> on arrival',
  '💰 Best deal: Bali 7 days from <strong>$1,200</strong>',
  '🌍 <strong>Va Travel</strong> now available in 180+ countries',
];

const CATS_AR = ['🔥 الأكثر طلباً', '🏖️ شواطئ', '🏔️ جبال', '🏙️ مدن', '🌿 طبيعة', '🎭 ثقافة', '🍽️ مأكولات'];
const CATS_EN = ['🔥 Trending', '🏖️ Beaches', '🏔️ Mountains', '🏙️ Cities', '🌿 Nature', '🎭 Culture', '🍽️ Culinary'];

const FLASH = [
  { destAr: 'دبي', destEn: 'Dubai', off: '35%', price: 546, orig: 840, flag: '🇦🇪' },
  { destAr: 'بالي', destEn: 'Bali', off: '40%', price: 252, orig: 420, flag: '🇮🇩' },
  { destAr: 'روما', destEn: 'Rome', off: '25%', price: 510, orig: 680, flag: '🇮🇹' },
  { destAr: 'بانكوك', destEn: 'Bangkok', off: '50%', price: 180, orig: 360, flag: '🇹🇭' },
  { destAr: 'سنغافورة', destEn: 'Singapore', off: '30%', price: 420, orig: 600, flag: '🇸🇬' },
];

const DESTS = [
  { id: 1, nameAr: 'دبي', nameEn: 'Dubai', countryAr: 'الإمارات', countryEn: 'UAE', price: 840, img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600', weather: '☀️ 35°C', badge: '🔥' },
  { id: 2, nameAr: 'طوكيو', nameEn: 'Tokyo', countryAr: 'اليابان', countryEn: 'Japan', price: 650, img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600', weather: '🌸 22°C', badge: '🌟' },
  { id: 3, nameAr: 'باريس', nameEn: 'Paris', countryAr: 'فرنسا', countryEn: 'France', price: 720, img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600', weather: '⛅ 18°C', badge: '' },
  { id: 4, nameAr: 'المالديف', nameEn: 'Maldives', countryAr: 'المالديف', countryEn: 'Maldives', price: 1200, img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600', weather: '🌊 29°C', badge: '💎' },
  { id: 5, nameAr: 'بالي', nameEn: 'Bali', countryAr: 'إندونيسيا', countryEn: 'Indonesia', price: 420, img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600', weather: '🌴 27°C', badge: '' },
  { id: 6, nameAr: 'سانتوريني', nameEn: 'Santorini', countryAr: 'اليونان', countryEn: 'Greece', price: 590, img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600', weather: '🌞 24°C', badge: '' },
];

const HOTELS = [
  { id: 1, name: 'Burj Al Arab', stars: 5, loc: 'Dubai, UAE', price: 840, orig: 980, score: 9.8, tags: ['Sea View', 'Butler', 'Pool'], priceDrop: true, img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600' },
  { id: 2, name: 'Four Seasons Bora Bora', stars: 5, loc: 'French Polynesia', price: 1200, score: 9.9, tags: ['Overwater', 'Snorkel', 'Spa'], priceDrop: false, img: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600' },
  { id: 3, name: 'The Peninsula Tokyo', stars: 5, loc: 'Tokyo, Japan', price: 650, orig: 750, score: 9.7, tags: ['City View', 'Fine Dining', 'Spa'], priceDrop: true, img: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600' },
  { id: 4, name: 'Hotel de Russie', stars: 5, loc: 'Rome, Italy', price: 680, score: 9.6, tags: ['Garden', 'Spa', 'Trattoria'], priceDrop: false, img: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600' },
];

const TABS = (ar: boolean) => [
  { id: 'hotels', icon: '🏨', label: ar ? 'فنادق' : 'Hotels' },
  { id: 'flights', icon: '✈️', label: ar ? 'رحلات' : 'Flights', soon: true },
  { id: 'pkgs', icon: '🎁', label: ar ? 'باقات' : 'Packages' },
  { id: 'visa', icon: '🛂', label: ar ? 'تأشيرة' : 'Visa' },
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
  const [tab, setTab] = useState('hotels');
  const [activeCat, setActiveCat] = useState(0);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [query, setQuery] = useState('');

  const toggleWish = (id: number) =>
    setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));

  const ticker = ar ? TICKER_AR : TICKER_EN;
  const cats = ar ? CATS_AR : CATS_EN;

  return (
    <main className={styles.main} dir={ar ? 'rtl' : 'ltr'}>

      {/* ── Ticker ── */}
      <div className={styles.ticker}>
        <div className={styles.tickerInner}>
          {[...ticker, ...ticker].map((item, i) => (
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
            <span>●</span> {ar ? 'ذكاء اصطناعي حقيقي · حجوزات حقيقية · 180+ دولة' : 'Real AI · Real Bookings · 180+ Countries'}
          </div>
          <h1 className={styles.heroTitle}>
            {ar ? <>سافر <em>بذكاء.</em><br />عِش <em>بجرأة.</em></> : <><em>Travel</em> Smarter.<br /><em>Live</em> Bolder.</>}
          </h1>
          <p className={styles.heroSub}>
            {ar
              ? 'تخطيط مدعوم بالذكاء الاصطناعي، أسعار لحظية، حجز متكامل من البداية للنهاية — كل ما تحتاجه في منصة واحدة عالمية.'
              : 'AI-powered planning, real-time prices, seamless end-to-end booking — the most complete travel platform in the world.'}
          </p>

          <div className={styles.stats}>
            <div><div className={styles.statNum}><span>180</span>+</div><div className={styles.statLabel}>{ar ? 'وجهة' : 'Destinations'}</div></div>
            <div><div className={styles.statNum}><span>42</span>K</div><div className={styles.statLabel}>{ar ? 'فندق' : 'Hotels'}</div></div>
            <div><div className={styles.statNum}><span>8</span>M</div><div className={styles.statLabel}>{ar ? 'مسافر' : 'Travelers'}</div></div>
            <div><div className={styles.statNum}><span>6</span></div><div className={styles.statLabel}>{ar ? 'لغة' : 'Languages'}</div></div>
          </div>

          {/* Search widget */}
          <div className={styles.sw}>
            <div className={styles.stabs}>
              {TABS(ar).map((t) => (
                <button
                  key={t.id}
                  className={`${styles.stab} ${tab === t.id ? styles.on : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.icon} {t.label}
                  {t.soon && <span className={styles.soonBadge}>{ar ? 'قريباً' : 'Soon'}</span>}
                </button>
              ))}
            </div>
            <div className={styles.sbody}>
              <div className={styles.sfield}>
                <span>📍</span>
                <div style={{ flex: 1 }}>
                  <div className={styles.sfieldLbl}>{ar ? 'الوجهة' : 'Destination'}</div>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={ar ? 'إلى أين تريد السفر؟' : 'Where to?'}
                  />
                </div>
              </div>
              <div className={styles.sgrid2}>
                <div className={styles.sfield}>
                  <span>📅</span>
                  <div>
                    <div className={styles.sfieldLbl}>{ar ? 'تواريخ' : 'Dates'}</div>
                    <div style={{ fontSize: '.85rem', color: 'var(--tm)' }}>{ar ? 'اختر التواريخ' : 'Select dates'}</div>
                  </div>
                </div>
                <div className={styles.sfield}>
                  <span>👥</span>
                  <div>
                    <div className={styles.sfieldLbl}>{ar ? 'ضيوف' : 'Guests'}</div>
                    <div style={{ fontSize: '.85rem', color: 'var(--tm)' }}>{ar ? '2 بالغين · غرفة' : '2 Adults · 1 Room'}</div>
                  </div>
                </div>
              </div>
              <Link href={`/${locale}/hotels${query ? `?q=${encodeURIComponent(query)}` : ''}`} className={styles.sbtn}>
                🔍 {ar ? 'بحث بالذكاء الاصطناعي' : 'Search with AI'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Flash Deals ── */}
      <div className={styles.flash}>
        <div className={styles.flLbl}>
          <div className={styles.flFire}>🔥</div>
          <div className={styles.flLabel}>{ar ? 'عروض فلاش' : 'Flash Deals'}</div>
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
        {cats.map((c, i) => (
          <button key={c} className={`${styles.cat} ${i === activeCat ? styles.on : ''}`} onClick={() => setActiveCat(i)}>
            {c}
          </button>
        ))}
      </div>

      {/* ── Live Exchange Rates ── */}
      <div className={styles.sh}>
        <div className={styles.st}>💱 {ar ? 'أسعار الصرف اللحظية' : 'Live Exchange Rates'}</div>
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
        <div className={styles.st}>🌍 {ar ? 'الوجهات الأكثر شعبية' : 'Popular Destinations'}</div>
        <Link href={`/${locale}/attractions`} className={styles.sl}>{ar ? 'عرض الكل ←' : 'View all →'}</Link>
      </div>
      <div className={styles.dg}>
        {DESTS.map((d) => (
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
              <div className={styles.dp}>{ar ? 'من ' : 'From '}{fp(d.price)}{ar ? '/ليلة' : '/night'}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Hotels ── */}
      <div className={styles.sh}>
        <div className={styles.st}>🏆 {ar ? 'أفضل الفنادق تقييماً' : 'Top Rated Hotels'}</div>
        <Link href={`/${locale}/hotels`} className={styles.sl}>{ar ? 'عرض الكل ←' : 'View all →'}</Link>
      </div>
      <div className={styles.hs}>
        {HOTELS.map((h) => (
          <div key={h.id} className={styles.hc}>
            {h.priceDrop && <div className={styles.pdrop}>📉 {ar ? 'انخفض السعر' : 'Price Drop'}</div>}
            <img className={styles.hcImg} src={h.img} alt={h.name} loading="lazy" />
            <div className={styles.hbody}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className={styles.hname}>{h.name}</div>
                  <div className={styles.hstars}>{'★'.repeat(h.stars)}</div>
                  <div className={styles.hloc}>📍 {h.loc}</div>
                </div>
                <div style={{ textAlign: 'end' }}>
                  <div className={styles.hprice}>{fp(h.price)}<span style={{ fontSize: '.53rem' }}>/night</span></div>
                  {h.orig && <div className={styles.horig}>{fp(h.orig)}</div>}
                </div>
              </div>
              <div className={styles.brow}>
                <span className={`${styles.b} ${styles.bg}`}>✓ {ar ? 'إلغاء مجاني' : 'Free cancel'}</span>
                <span className={`${styles.b} ${styles.bb}`}>✓ {ar ? 'تأكيد فوري' : 'Instant confirm'}</span>
                <span className={`${styles.b} ${styles.ba}`}>🏆</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, margin: '5px 0' }}>
                {h.tags.map((t) => (
                  <span key={t} className={styles.b} style={{ background: 'var(--s2)', color: 'var(--td)' }}>{t}</span>
                ))}
              </div>
              <div className={styles.hf}>
                <div className={styles.hscore}>⭐ {h.score}</div>
                <Link href={`/${locale}/hotels`} className={styles.bookBtn}>{ar ? 'احجز →' : 'Book →'}</Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Traveler Reviews ── */}
      <div className={styles.sh}>
        <div className={styles.st}>⭐ {ar ? 'آراء المسافرين' : 'Traveler Reviews'}</div>
        <span className={styles.sl}>{ar ? 'المزيد ←' : 'More →'}</span>
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
        <div className={styles.st}>🚀 {ar ? 'مميزات الذكاء الاصطناعي الحصرية' : 'Exclusive AI Features'}</div>
      </div>
      <AIFeatureCards locale={locale} />

      <div className={styles.footer}>
        © 2026 Va Travel · {ar ? 'مدعوم بـ Claude AI' : 'Powered by Claude AI'} · 🌐 {ar ? 'لغات متعددة' : 'Multiple Languages'} · {ar ? 'حقوق محفوظة' : 'All rights reserved'}
      </div>

      <div style={{ height: '80px' }} />
    </main>
  );
}
