'use client';
// PATH: src/components/ui/Breadcrumb.tsx
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { VG } from '@/lib/tokens';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  locale: string;
  items: BreadcrumbItem[];
}

export function Breadcrumb({ locale, items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
      <Link href={`/${locale}`} style={{ fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--vg-text-3)', textDecoration: 'none', transition: 'color 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--vg-gold)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--vg-text-3)')}>
        Home
      </Link>

      {items.map((item, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ChevronRight size={10} color="var(--vg-text-3)" />
          {item.href ? (
            <Link href={item.href} style={{ fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--vg-text-3)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--vg-gold)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--vg-text-3)')}>
              {item.label}
            </Link>
          ) : (
            <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--vg-gold)' }}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

// ── Recently Viewed Tracker ──────────────────────────────
export interface RecentlyViewedItem {
  id: string;
  type: 'hotel' | 'attraction' | 'restaurant';
  name: string;
  thumbnail?: string;
  price?: number;
  currency?: string;
  rating?: number;
  city?: string;
}

const STORAGE_KEY = 'va-recently-viewed';
const MAX_ITEMS = 10;

export function addToRecentlyViewed(item: RecentlyViewedItem): void {
  if (typeof window === 'undefined') return;
  try {
    const stored: RecentlyViewedItem[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const filtered = stored.filter(i => i.id !== item.id);
    const updated = [item, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}
