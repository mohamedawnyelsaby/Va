'use client';
// PATH: src/app/[locale]/favorites/page.tsx

import Link from 'next/link';
import styles from './page.module.css';
import { useWishlist, DESTINATIONS } from '@/lib/wishlist';
import { t } from '@/lib/i18n/translations';

interface Props {
  params: { locale: string };
}

const isAr = (locale: string) => locale === 'ar';

export default function FavoritesPage({ params: { locale } }: Props) {
  const ar = isAr(locale);
  const tr = t(locale);
  const f = tr.favorites;
  const { ids, toggle } = useWishlist();
  const saved = DESTINATIONS.filter(d => ids.includes(d.id));

  return (
    <main className={styles.main} dir={ar ? 'rtl' : 'ltr'}>
      <div className={styles.sh}>
        <div className={styles.st}>❤️ {tr.profile.menuSaved}</div>
      </div>

      <div className={styles.dg}>
        {saved.length === 0 ? (
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
          saved.map(d => (
            <div key={d.id} className={styles.dc}>
              <img src={d.img} alt={ar ? d.nameAr : d.nameEn} loading="lazy" />
              <button
                className={styles.wbtn}
                onClick={() => toggle(d.id)}
                aria-label={f.removeSaved}
              >
                ❤️
              </button>
              <div className={styles.di}>
                <div className={styles.dn}>{ar ? d.nameAr : d.nameEn}</div>
                <div className={styles.dc2}>{ar ? d.countryAr : d.countryEn}</div>
                <div className={styles.dp}>${d.price}{tr.home.perNight}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
