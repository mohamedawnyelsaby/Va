'use client';
// src/components/ui/ReviewsSection.tsx
//
// Lists the reviews for a hotel / attraction / restaurant.
//
// The detail pages used to read `hotel.reviews`, but /api/hotels/:id never
// included reviews, so the list was ALWAYS empty: reviews could be written
// (and the rating recomputed) but nobody could ever see them. This component
// loads them from GET /api/reviews, which already existed.

import { useEffect, useState } from 'react';
import { MessageSquare, ShieldCheck } from 'lucide-react';
import { VG, monoLabel } from '@/lib/tokens';

export interface ReviewItem {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  verified: boolean;
  createdAt: string;
  user?: { name: string | null } | null;
}

type ViewState = 'loading' | 'error' | 'ready';

interface ViewProps {
  label: string;
  state: ViewState;
  reviews: ReviewItem[];
  total: number;
  emptyHint: string;
  locale: string;
  onWrite: () => void;
  onRetry: () => void;
}

function formatMonth(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {return '';}
  try {
    return d.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
  } catch {
    return d.toLocaleDateString('en', { month: 'short', year: 'numeric' });
  }
}

/** Presentational part: no data fetching, so every state can be rendered and tested. */
export function ReviewsView({ label, state, reviews, total, emptyHint, locale, onWrite, onRetry }: ViewProps) {
  const muted = { fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'var(--vg-text-3)' } as const;
  return (
    <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', borderTop: 'none', padding: '2rem', marginBottom: '1px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="vg-overline">
          {label}
          {state === 'ready' && total > 0 ? ` (${total})` : ''}
        </div>
        <button onClick={onWrite} className="vg-btn-outline" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
          <MessageSquare size={14} aria-hidden /> Write Review
        </button>
      </div>

      {state === 'loading' && <p style={{ ...muted, margin: 0 }}>Loading reviews…</p>}

      {state === 'error' && (
        <div style={{ ...muted, display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span>Couldn&apos;t load reviews.</span>
          <button onClick={onRetry} className="vg-btn-outline" style={{ padding: '0.4rem 0.9rem' }}>Try again</button>
        </div>
      )}

      {state === 'ready' && reviews.length === 0 && (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.3rem', color: 'var(--vg-text-3)', marginBottom: '0.6rem' }}>No reviews yet</div>
          <p style={{ ...muted, margin: 0 }}>{emptyHint}</p>
        </div>
      )}

      {state === 'ready' &&
        reviews.map((review, index) => (
          <div
            key={review.id}
            style={{
              paddingBottom: '1.5rem',
              marginBottom: index === reviews.length - 1 ? 0 : '1.5rem',
              borderBottom: index === reviews.length - 1 ? 'none' : '1px solid var(--vg-border)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.6rem' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.body, color: 'var(--vg-text)', marginBottom: '0.25rem' }}>
                  {review.user?.name || 'Guest'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <span aria-label={`${review.rating} out of 5`} style={{ display: 'flex', gap: '2px' }}>
                    {Array.from({ length: Math.max(0, Math.min(5, review.rating)) }).map((_, i) => (
                      <span key={i} style={{ color: 'var(--vg-star)', fontSize: '0.75rem' }} aria-hidden>★</span>
                    ))}
                  </span>
                  {review.verified && (
                    <span style={{ ...monoLabel, display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--vg-gold)' }}>
                      <ShieldCheck size={12} aria-hidden /> Verified
                    </span>
                  )}
                </div>
              </div>
              <div style={{ ...monoLabel, flexShrink: 0 }}>{formatMonth(review.createdAt, locale)}</div>
            </div>
            {review.title && (
              <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.05rem', color: 'var(--vg-text)', marginBottom: '0.4rem' }}>{review.title}</div>
            )}
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'var(--vg-text-2)', lineHeight: 1.7, margin: 0 }}>{review.comment}</p>
          </div>
        ))}
    </div>
  );
}

interface SectionProps {
  itemId: string;
  itemType: 'hotel' | 'attraction' | 'restaurant';
  label: string;
  emptyHint: string;
  locale: string;
  onWrite: () => void;
  /** Change this value to reload the list (e.g. after a review was submitted). */
  refreshKey?: number;
}

export function ReviewsSection({ itemId, itemType, label, emptyHint, locale, onWrite, refreshKey = 0 }: SectionProps) {
  const [state, setState] = useState<ViewState>('loading');
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [total, setTotal] = useState(0);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => (s === 'ready' ? s : 'loading'));
    fetch(`/api/reviews?itemId=${encodeURIComponent(itemId)}&itemType=${itemType}&limit=5`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {throw new Error(`HTTP ${res.status}`);}
        const data = await res.json();
        setReviews(Array.isArray(data.reviews) ? data.reviews : []);
        setTotal(Number(data.pagination?.total) || 0);
        setState('ready');
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') {setState('error');}
      });
    return () => controller.abort();
  }, [itemId, itemType, refreshKey, attempt]);

  return (
    <ReviewsView
      label={label}
      state={state}
      reviews={reviews}
      total={total}
      emptyHint={emptyHint}
      locale={locale}
      onWrite={onWrite}
      onRetry={() => setAttempt((n) => n + 1)}
    />
  );
}
