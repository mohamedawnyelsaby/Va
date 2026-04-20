'use client';
// PATH: src/components/sections/popular-destinations.tsx
// REDESIGN: Magazine editorial — hoverable, cinematic image cards
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import TiltCard from '@/components/ui/TiltCard';
import { t } from '@/lib/i18n/translations';

const DESTINATIONS = [
  { city: 'Dubai',    country: 'UAE',       price: '1,200 π', tag: 'Luxury',  img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=900&q=85' },
  { city: 'Tokyo',    country: 'Japan',     price: '980 π',   tag: 'Culture', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=900&q=85' },
  { city: 'Paris',    country: 'France',    price: '1,100 π', tag: 'Romance', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=900&q=85' },
  { city: 'Maldives', country: 'Maldives',  price: '2,400 π', tag: 'Beach',   img: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=900&q=85' },
  { city: 'New York', country: 'USA',       price: '1,350 π', tag: 'Urban',   img: 'https://images.unsplash.com/photo-1546436836-07a91091f160?w=900&q=85' },
  { city: 'Bali',     country: 'Indonesia', price: '750 π',   tag: 'Nature',  img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900&q=85' },
];

const TICKER = ['Dubai','Tokyo','Paris','Maldives','New York','Bali','London','Barcelona','Singapore','Cairo','Sydney','Istanbul','Prague','Kyoto','Amsterdam'];

export function PopularDestinations({ locale }: { locale: string }) {
  const tr = t(locale);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.06 }
    );
    sectionRef.current?.querySelectorAll('.vg-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} style={{
      background: 'var(--vg-bg-surface)',
      padding: 'clamp(5rem, 9vw, 8rem) 0',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Subtle background glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(212,168,83,0.04) 0%, transparent 60%)',
      }} />

      {/* ── Header ── */}
      <div style={{
        padding: '0 clamp(1.5rem, 7vw, 5rem)',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-end', marginBottom: 'clamp(2.5rem, 5vw, 4rem)',
        flexWrap: 'wrap', gap: '1.5rem',
      }}>
        <div>
          <div className="vg-overline vg-reveal" style={{ marginBottom: '1rem' }}>
            {tr.destinations.sectionTag}
          </div>
          <h2 className="vg-display vg-reveal d1" style={{
            fontSize: 'clamp(2.8rem, 6vw, 5.5rem)',
          }}>
            {tr.destinations.sectionTitle1}{' '}
            <em className="vg-italic">{tr.destinations.sectionTitle2}</em>
          </h2>
        </div>

        <Link href={`/${locale}/hotels`} className="vg-btn-outline vg-reveal d2" style={{ textDecoration: 'none' }}>
          {tr.destinations.viewAll} <ArrowRight size={13} />
        </Link>
      </div>

      {/* ── Destination Grid ── */}
      <div style={{
        padding: '0 clamp(1.5rem, 7vw, 5rem)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
        gap: '1px',
        background: 'var(--vg-border)',
      }}>
        {DESTINATIONS.map((dest, i) => (
          <TiltCard
            key={dest.city}
            className={`vg-reveal d${(i % 4) + 1}`}
            style={{ display: 'block' }}
          >
            <Link
              href={`/${locale}/hotels?city=${dest.city}`}
              style={{
                display: 'block', textDecoration: 'none',
                position: 'relative', height: '320px',
                overflow: 'hidden', cursor: 'pointer',
              }}
              className="dest-card"
            >
              {/* Image */}
              <img
                src={dest.img}
                alt={dest.city}
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%', objectFit: 'cover',
                  filter: 'brightness(0.60) saturate(0.70)',
                  transition: 'transform 0.8s cubic-bezier(0.23,1,0.32,1), filter 0.5s ease',
                }}
                className="dest-img"
              />

              {/* Gradient overlays */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(6,5,15,0.95) 0%, rgba(6,5,15,0.30) 50%, transparent 100%)',
              }} />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(212,168,83,0.12) 0%, transparent 60%)',
                opacity: 0,
                transition: 'opacity 0.4s ease',
              }} className="dest-glow" />

              {/* Price badge */}
              <div style={{
                position: 'absolute', top: '1rem', right: '1rem',
                background: 'rgba(6,5,15,0.88)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(212,168,83,0.38)',
                padding: '0.28rem 0.72rem',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.56rem', letterSpacing: '0.08em',
                color: 'var(--vg-gold-4)',
                zIndex: 2,
                boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
              }}>
                {dest.price}
              </div>

              {/* Category badge */}
              <div style={{
                position: 'absolute', top: '1rem', left: '1rem',
                background: 'var(--vg-gold-dim)',
                backdropFilter: 'blur(6px)',
                border: '1px solid var(--vg-gold-border)',
                padding: '0.20rem 0.65rem',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.50rem', letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--vg-gold)',
                zIndex: 2,
              }}>
                {dest.tag}
              </div>

              {/* Bottom content */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: '2rem 1.4rem 1.3rem',
                zIndex: 2,
              }}>
                {/* Arrow indicator */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  marginBottom: '0.5rem',
                  opacity: 0,
                  transform: 'translateX(-8px)',
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                }} className="dest-arrow">
                  <div style={{ width: '1.5rem', height: '1px', background: 'var(--vg-gold)' }} />
                  <span style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.50rem', letterSpacing: '0.20em',
                    textTransform: 'uppercase', color: 'var(--vg-gold)',
                  }}>
                    Explore
                  </span>
                </div>

                <div style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: 'clamp(1.9rem, 3.5vw, 2.4rem)',
                  fontWeight: 300,
                  color: '#FAF7F2', lineHeight: 0.95,
                  letterSpacing: '-0.01em',
                  marginBottom: '0.35rem',
                }}>
                  {dest.city}
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                }}>
                  <MapPin size={10} color="rgba(250,247,242,0.45)" />
                  <span style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.48rem', letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(250,247,242,0.45)',
                  }}>
                    {dest.country}
                  </span>
                </div>
              </div>
            </Link>
          </TiltCard>
        ))}
      </div>

      {/* ── Ticker ── */}
      <div className="vg-ticker-wrap" style={{ marginTop: 'clamp(3rem, 5vw, 5rem)' }}>
        <div className="vg-ticker-inner">
          {[...TICKER, ...TICKER, ...TICKER].map((item, i) => (
            <span key={i} className="vg-ticker-item">
              <span className="tag">◆</span>{item}
            </span>
          ))}
        </div>
      </div>

      {/* Hover styles */}
      <style>{`
        .dest-card:hover .dest-img {
          transform: scale(1.07);
          filter: brightness(0.45) saturate(0.60);
        }
        .dest-card:hover .dest-glow { opacity: 1 !important; }
        .dest-card:hover .dest-arrow {
          opacity: 1 !important;
          transform: translateX(0) !important;
        }
      `}</style>
    </section>
  );
}
