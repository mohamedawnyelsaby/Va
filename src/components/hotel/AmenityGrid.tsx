// src/components/hotel/AmenityGrid.tsx
// Amenity tiles for a hotel: one icon + label per amenity.
import { getAmenityIcon } from '@/lib/amenity-icons';

export function AmenityGrid({ amenities }: { amenities: string[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
      {amenities.map((name) => {
        const Icon = getAmenityIcon(name);
        return (
          <div
            key={name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.7rem 0.85rem',
              background: 'var(--vg-bg-surface)',
              border: '1px solid var(--vg-border)',
            }}
          >
            <Icon size={16} color="var(--vg-gold)" aria-hidden style={{ flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--vg-text-2)', lineHeight: 1.3 }}>
              {name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
