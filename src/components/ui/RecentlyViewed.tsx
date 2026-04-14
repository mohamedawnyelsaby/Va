'use client';
// PATH: src/components/ui/RecentlyViewed.tsx
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { VG, monoLabel } from '@/lib/tokens';
import { getRecentlyViewed, type RecentlyViewedItem } from './Breadcrumb';
import { formatCurrency } from '@/lib/utils';

interface RecentlyViewedProps {
  locale: string;
  exclude?: string;
}

export function RecentlyViewed({ locale, exclude }: RecentlyViewedProps) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    const all = getRecentlyViewed();
    setItems(exclude ? all.filter(i => i.id !== exclude) : all);
  }, [exclude]);

  if (!items.length) return null;

  return (
    <div>
      <div className="vg-overline" style={{ marginBottom: '1.2rem' }}>Recently Viewed</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--vg-border)' }}>
        {items.slice(0, 5).map(item => {
          const href = `/${locale}/${item.type === 'hotel' ? 'hotels' : item.type === 'attraction' ? 'attractions' : 'restaurants'}/${item.id}`;
          return (
            <Link key={item.id} href={href} style={{ textDecoration: 'none', display: 'flex', gap: '0.85rem', alignItems: 'center', background: 'var(--vg-bg-card)', padding: '0.85rem 1rem', transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--vg-gold-dim2)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--vg-bg-card)'}
            >
              {item.thumbnail && (
                <div style={{ width: '52px', height: '40px', position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
                  <Image src={item.thumbnail} alt={item.name} fill style={{ objectFit: 'cover', filter: 'brightness(0.75) saturate(0.7)' }} sizes="52px" />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1rem', fontWeight: 300, color: 'var(--vg-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.2rem' }}>
                  {item.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {item.city && <span style={{ ...monoLabel, fontSize: '0.55rem' }}>{item.city}</span>}
                  {item.rating && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Star size={9} style={{ color: 'var(--vg-star)', fill: 'var(--vg-star)' }} />
                      <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.58rem', color: 'var(--vg-gold)' }}>{item.rating.toFixed(1)}</span>
                    </span>
                  )}
                </div>
              </div>
              {item.price != null && item.price > 0 && (
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '0.95rem', fontWeight: 300, color: 'var(--vg-gold)' }}>
                    {formatCurrency(item.price, item.currency || 'USD')}
                  </div>
                  <div style={{ ...monoLabel, fontSize: '0.5rem' }}>/ night</div>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
