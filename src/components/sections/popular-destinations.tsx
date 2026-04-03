// PATH: src/components/sections/popular-destinations.tsx
'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const DESTINATIONS = [
  {
    name: 'Paris',
    country: 'France',
    slug: 'paris',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    rating: 4.9,
    hotels: 1250,
    desc: 'The City of Light — art, fashion and timeless romance',
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    slug: 'tokyo',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    rating: 4.8,
    hotels: 2100,
    desc: 'Ancient tradition meets neon-lit modernity',
  },
  {
    name: 'Dubai',
    country: 'UAE',
    slug: 'dubai',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
    rating: 4.7,
    hotels: 850,
    desc: 'Luxury redefined in the desert sky',
  },
  {
    name: 'New York',
    country: 'USA',
    slug: 'new-york',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
    rating: 4.8,
    hotels: 1800,
    desc: 'The city that never sleeps, never disappoints',
  },
  {
    name: 'Rome',
    country: 'Italy',
    slug: 'rome',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',
    rating: 4.9,
    hotels: 920,
    desc: 'Walk through millennia of living history',
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    slug: 'bali',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
    rating: 4.7,
    hotels: 650,
    desc: 'Sacred temples and emerald terraced rice fields',
  },
];

export function PopularDestinations({ locale }: { locale: string }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll('.vg-reveal');
    if (!els) return;
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="vg-section"
      style={{ background: 'var(--vg-bg-surface)' }}
    >
      {/* Ticker */}
      <div className="vg-ticker-wrap" style={{ marginBottom: '4rem' }}>
        <div className="vg-ticker-inner">
          {[...DESTINATIONS, ...DESTINATIONS].map((d, i) => (
            <span key={i} className="vg-ticker-item">
              <span className="tag">◆</span>
              {d.name}, {d.country}
            </span>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="vg-reveal" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="vg-overline" style={{ marginBottom: '1rem' }}>Popular Destinations</div>
          <h2 style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontWeight: 300,
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            color: 'var(--vg-text)',
            lineHeight: 0.95,
          }}>
            Where Will You<br />
            <em style={{ color: 'var(--vg-gold)', fontStyle: 'italic' }}>Go Next?</em>
          </h2>
        </div>
        <Link href={`/${locale}/cities`}>
          <button className="vg-btn-outline">
            All Destinations
            <ArrowRight style={{ width: 12, height: 12 }} />
          </button>
        </Link>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1px',
        background: 'var(--vg-border)',
      }}>
        {DESTINATIONS.map((dest, i) => (
          <Link
            key={dest.slug}
            href={`/${locale}/hotels?city=${dest.name}`}
            style={{ textDecoration: 'none' }}
          >
            <div
              className={`vg-hotel-card vg-reveal d${(i % 3) + 1}`}
              style={{ height: 320, position: 'relative' }}
            >
              {/* Image */}
              <Image
                src={dest.image}
                alt={dest.name}
                fill
                className="vg-hotel-thumb"
                sizes="(max-width: 768px) 100vw, 33vw"
                loading={i < 3 ? 'eager' : 'lazy'}
              />

              {/* Overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(3,2,10,0.90) 0%, rgba(3,2,10,0.2) 60%, transparent 100%)',
                zIndex: 1,
              }} />

              {/* Price tag */}
              <div className="vg-price-tag" style={{ zIndex: 2 }}>
                ★ {dest.rating}
              </div>

              {/* Content */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem', zIndex: 2 }}>
                <p style={{
                  fontFamily: 'var(--font-space-mono), monospace',
                  fontSize: '0.5rem',
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: 'var(--vg-gold)',
                  marginBottom: '0.4rem',
                }}>
                  {dest.country} · {dest.hotels} hotels
                </p>
                <h3 style={{
                  fontFamily: 'var(--font-cormorant), serif',
                  fontWeight: 300,
                  fontSize: '1.8rem',
                  color: '#F2EEE6',
                  lineHeight: 1,
                  marginBottom: '0.4rem',
                }}>
                  {dest.name}
                </h3>
                <p style={{
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: '0.75rem',
                  color: 'rgba(242,238,230,0.6)',
                  lineHeight: 1.5,
                }}>
                  {dest.desc}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
