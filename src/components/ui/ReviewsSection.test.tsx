// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReviewsView, type ReviewItem } from '@/components/ui/ReviewsSection';

const noop = vi.fn();
const base = { label: 'Guest Reviews', total: 0, emptyHint: 'Be the first to review this hotel.', locale: 'en', onWrite: noop, onRetry: noop };

const review = (over: Partial<ReviewItem> = {}): ReviewItem => ({
  id: 'r1',
  rating: 4,
  title: 'Lovely stay',
  comment: 'Clean rooms and a great breakfast.',
  verified: false,
  createdAt: '2026-09-15T10:00:00.000Z',
  user: { name: 'Mona' },
  ...over,
});

describe('ReviewsView', () => {
  it('empty: says so and shows the hint (not a blank gap)', () => {
    const html = renderToStaticMarkup(<ReviewsView {...base} state="ready" reviews={[]} />);
    expect(html).toContain('No reviews yet');
    expect(html).toContain('Be the first to review this hotel.');
  });

  it('always offers "Write Review", in every state', () => {
    for (const state of ['loading', 'error', 'ready'] as const) {
      expect(renderToStaticMarkup(<ReviewsView {...base} state={state} reviews={[]} />)).toContain('Write Review');
    }
  });

  it('lists real reviews with name, stars, title, comment and the review count', () => {
    const html = renderToStaticMarkup(<ReviewsView {...base} state="ready" total={7} reviews={[review()]} />);
    expect(html).toContain('Mona');
    expect(html).toContain('Lovely stay');
    expect(html).toContain('Clean rooms and a great breakfast.');
    expect(html).toContain('Guest Reviews (7)');
    expect((html.match(/★/g) ?? []).length).toBe(4);
    expect(html).not.toContain('No reviews yet');
  });

  it('marks only reviews from a paid booking as Verified', () => {
    const html = renderToStaticMarkup(
      <ReviewsView {...base} state="ready" reviews={[review({ id: 'a', verified: true }), review({ id: 'b', verified: false })]} />
    );
    expect((html.match(/Verified/g) ?? []).length).toBe(1);
  });

  it('falls back to "Guest" when the reviewer has no name, and clamps bad ratings', () => {
    const html = renderToStaticMarkup(
      <ReviewsView {...base} state="ready" reviews={[review({ user: { name: null }, rating: 99 })]} />
    );
    expect(html).toContain('Guest');
    expect((html.match(/★/g) ?? []).length).toBe(5);
  });

  it('loading and error states show a message and, for errors, a retry button', () => {
    expect(renderToStaticMarkup(<ReviewsView {...base} state="loading" reviews={[]} />)).toContain('Loading reviews');
    const err = renderToStaticMarkup(<ReviewsView {...base} state="error" reviews={[]} />);
    expect(err).toContain('load reviews');
    expect(err).toContain('Try again');
    expect(err).not.toContain('No reviews yet');
  });

  it('does not crash on an invalid date', () => {
    expect(() =>
      renderToStaticMarkup(<ReviewsView {...base} state="ready" reviews={[review({ createdAt: 'not-a-date' })]} />)
    ).not.toThrow();
  });
});
