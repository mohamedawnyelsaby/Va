// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AmenityGrid } from '@/components/hotel/AmenityGrid';

// The exact list the production hotel in the bug report was seeded with.
const html = renderToStaticMarkup(<AmenityGrid amenities={['WiFi', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Gym']} />);

describe('AmenityGrid (regression: Pool showed a coffee cup; Spa and Bar showed the Wi-Fi icon)', () => {
  it('draws each amenity with its own icon', () => {
    const icons = [...html.matchAll(/lucide-([a-z0-9-]+)/g)].map((m) => m[1]);
    // every tile has an svg: lucide-<name> appears once per icon
    expect(icons).toEqual(expect.arrayContaining(['wifi', 'waves', 'sparkles', 'utensils', 'martini', 'dumbbell']));
  });

  it('Wi-Fi appears exactly once (it used to be the fallback for unknown amenities)', () => {
    expect((html.match(/lucide-wifi/g) ?? []).length).toBe(1);
  });

  it('never shows a coffee cup for the pool', () => {
    expect(html).not.toContain('lucide-coffee');
  });

  it('renders one tile per amenity, with its label', () => {
    expect((html.match(/<svg /g) ?? []).length).toBe(6);
    for (const name of ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Gym']) {expect(html).toContain(`>${name}<`);}
  });
});
