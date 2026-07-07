'use client';
// PATH: src/app/[locale]/favorites/page.tsx

import Link from 'next/link';
import styles from './page.module.css';
import { useWishlist, DESTINATIONS } from '@/lib/wishlist';

interface Props {
  params: { locale: string };
}

const isAr = (locale: string) => locale === 'ar';

export default function FavoritesPage({ params: { locale } }: Props) {
  const ar = isAr(locale);
  const { ids, toggle } = useWishlist();
  const saved = DESTINATIONS.filter(d => ids.includes(d.id));

  return (
    <main className={styles.main} dir={ar ? 'rtl' : 'ltr'}>
      <div className={styles.sh}>
        <div className={styles.st}>❤️ {ar ? 'الأماكن المحفوظة' : 'Saved Places'}</div>
      </div>

      <div className={styles.dg}>
        {saved.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIco}>🗺️</div>
            <div className={styles.emptyTitle}>{ar ? 'لا توجد أماكن محفوظة بعد' : 'No saved places yet'}</div>
            <div className={styles.emptySub}>
              {ar ? 'اضغط ❤️ على أي وجهة في الصفحة الرئيسية لحفظها هنا' : 'Tap ❤️ on any destination on the home page to save it here'}
            </div>
            <Link href={`/${locale}`} className={styles.emptyBtn}>
              {ar ? 'استكشف الوجهات' : 'Explore destinations'}
            </Link>
          </div>
        ) : (
          saved.map(d => (
            <div key={d.id} className={styles.dc}>
              <img src={d.img} alt={ar ? d.nameAr : d.nameEn} loading="lazy" />
              <button
                className={styles.wbtn}
                onClick={() => toggle(d.id)}
                aria-label={ar ? 'إزالة من المحفوظات' : 'Remove from saved'}
              >
                ❤️
              </button>
              <div className={styles.di}>
                <div className={styles.dn}>{ar ? d.nameAr : d.nameEn}</div>
                <div className={styles.dc2}>{ar ? d.countryAr : d.countryEn}</div>
                <div className={styles.dp}>${d.price}{ar ? '/ليلة' : '/night'}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
