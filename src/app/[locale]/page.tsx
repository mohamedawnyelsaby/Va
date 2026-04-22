/* ============================================================
   PATH: app/[locale]/page.tsx
   ============================================================ */

import Link from 'next/link';
import styles from './page.module.css';

interface Props {
  params: { locale: string };
}

const isAr = (locale: string) => locale === 'ar';

const FEATURES = (locale: string) => [
  {
    icon: '✦',
    num: '01',
    title: isAr(locale) ? 'سفر بالذكاء الاصطناعي' : 'AI-Powered Travel',
    desc: isAr(locale)
      ? 'توصيات مخصصة مدعومة بـ Claude AI، تتعلم تفضيلاتك في كل رحلة.'
      : 'Personalized recommendations powered by Claude AI, learning your preferences with every trip.',
  },
  {
    icon: '◎',
    num: '02',
    title: isAr(locale) ? 'وصول عالمي' : 'Global Access',
    desc: isAr(locale)
      ? 'أكثر من 180 دولة، 50,000+ عقار، وملايين التجارب في متناول يدك.'
      : 'Over 180 countries, 50,000+ properties, and millions of experiences at your fingertips.',
  },
  {
    icon: '▣',
    num: '03',
    title: isAr(locale) ? 'حجز سلس' : 'Seamless Booking',
    desc: isAr(locale)
      ? 'احجز الفنادق والجولات والمطاعم بسلاسة تامة — مدفوعات آمنة وفورية.'
      : 'Book hotels, tours and restaurants effortlessly — secure and instant payments.',
  },
  {
    icon: '◈',
    num: '04',
    title: isAr(locale) ? 'قوائم موثّقة' : 'Verified Listings',
    desc: isAr(locale)
      ? 'كل عقار ومعلم يُراجع يدوياً لضمان أعلى معايير الجودة.'
      : 'Every property and landmark is manually reviewed to ensure the highest quality standards.',
  },
];

const CATEGORIES = (locale: string) => [
  { href: `/${locale}/hotels`,      emoji: '🏨', label: isAr(locale) ? 'الفنادق'   : 'Hotels'      },
  { href: `/${locale}/landmarks`,   emoji: '🏛️', label: isAr(locale) ? 'المعالم'   : 'Landmarks'   },
  { href: `/${locale}/restaurants`, emoji: '🍽️', label: isAr(locale) ? 'المطاعم'   : 'Restaurants' },
  { href: `/${locale}/ai`,          emoji: '✨', label: isAr(locale) ? 'مساعد AI'  : 'AI Guide'    },
];

export default function HomePage({ params: { locale } }: Props) {
  const ar = isAr(locale);

  return (
    <main className={styles.main} dir={ar ? 'rtl' : 'ltr'}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.heroBgInner} />
        </div>
        <div className={styles.heroContent}>
          <span className="badge badge-gold animate-fadeUp">
            {ar ? '✦ مدعوم بـ Claude AI' : '✦ Powered by Claude AI'}
          </span>
          <h1 className={`${styles.heroTitle} animate-fadeUp delay-100`}>
            {ar ? (
              <><em>سافر</em> بذكاء.<br />اكتشف العالم.</>
            ) : (
              <><em>Travel</em> smarter.<br />Discover the world.</>
            )}
          </h1>
          <p className={`${styles.heroSub} animate-fadeUp delay-200`}>
            {ar
              ? 'مساعدك الذكي للسفر — يخطط، يحجز، ويرشدك في كل خطوة.'
              : 'Your intelligent travel companion — plans, books, and guides you every step of the way.'}
          </p>
          <div className={`${styles.heroCtas} animate-fadeUp delay-300`}>
            <Link href={`/${locale}/ai`} className="btn btn-primary">
              {ar ? 'ابدأ الاستكشاف' : 'Start Exploring'}
            </Link>
            <Link href={`/${locale}/hotels`} className="btn btn-outline">
              {ar ? 'تصفح الفنادق' : 'Browse Hotels'}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <div className={styles.statsStrip}>
        {[
          { val: '180+', label: ar ? 'دولة' : 'Countries' },
          { val: '50K+', label: ar ? 'عقار' : 'Properties' },
          { val: '4.9★', label: ar ? 'تقييم' : 'Rating' },
          { val: '2M+', label: ar ? 'مسافر' : 'Travelers' },
        ].map(s => (
          <div key={s.label} className={styles.stat}>
            <span className={styles.statVal}>{s.val}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Quick Categories ── */}
      <section className={styles.section}>
        <h2 className={`text-label muted ${styles.sectionLabel}`}>
          {ar ? 'استكشف' : 'Explore'}
        </h2>
        <div className={styles.categories}>
          {CATEGORIES(locale).map(cat => (
            <Link key={cat.href} href={cat.href} className={styles.catCard}>
              <span className={styles.catEmoji}>{cat.emoji}</span>
              <span className={styles.catLabel}>{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className={styles.section}>
        <h2 className={`text-label muted ${styles.sectionLabel}`}>
          {ar ? 'لماذا Va Travel' : 'Why Va Travel'}
        </h2>

        <div className={styles.features}>
          {FEATURES(locale).map((f, i) => (
            <div key={f.num} className={`${styles.featureCard} card`}>
              <div className={styles.featureTop}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <span className={styles.featureNum}>{f.num}</span>
              </div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={`text-body muted ${styles.featureDesc}`}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaInner}>
          <h2 className={`${styles.ctaTitle}`}>
            {ar ? 'جاهز لرحلتك القادمة؟' : 'Ready for your next adventure?'}
          </h2>
          <p className={`text-body ${styles.ctaSub}`}>
            {ar
              ? 'دعنا نخطط لها معاً — مجاناً وبذكاء.'
              : 'Let\'s plan it together — free and intelligent.'}
          </p>
          <Link href={`/${locale}/ai`} className="btn btn-primary">
            {ar ? 'تحدث مع Logy AI ✨' : 'Chat with Logy AI ✨'}
          </Link>
        </div>
      </section>

      {/* Bottom padding for nav */}
      <div style={{ height: '80px' }} />
    </main>
  );
}
