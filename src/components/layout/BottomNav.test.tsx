// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('next/navigation', () => ({ usePathname: () => '/en/favorites' }));

import { BottomNav } from '@/components/layout/BottomNav';

const html = renderToStaticMarkup(<BottomNav locale="en" />);

describe('BottomNav', () => {
  it('renders six tabs, each with a vector icon', () => {
    expect((html.match(/<a /g) ?? []).length).toBe(6);
    expect((html.match(/<svg /g) ?? []).length).toBe(6);
  });

  it('uses no emoji (they render differently on every phone and cannot take the active colour)', () => {
    expect(html).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  it('marks only the current tab as active, for styling and for screen readers', () => {
    expect((html.match(/aria-current="page"/g) ?? []).length).toBe(1);
    expect(html).toMatch(/class="bni on"[^>]*aria-current="page"[^>]*href="\/en\/favorites"|href="\/en\/favorites"[^>]*class="bni on"/);
  });

  it('keeps the AI tab dot', () => {
    expect(html).toContain('bni-dot on');
  });

  it('icons are decorative: hidden from assistive tech', () => {
    expect((html.match(/aria-hidden="true"/g) ?? []).length).toBeGreaterThanOrEqual(6);
  });
});
