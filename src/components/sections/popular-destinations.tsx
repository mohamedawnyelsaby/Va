'use client';
// PATH: src/components/sections/popular-destinations.tsx
// FIX: Image filter now uses CSS class vg-hotel-thumb — adapts to light/dark via globals.css
// FIX: inline image style removed so the CSS variable --vg-thumb-filter takes effect
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import TiltCard from '@/components/ui/TiltCard';
import { t } from '@/lib/i18n/translations';

const DESTINATIONS = [
  { city: 'Dubai',    country: 'UAE',       price: '1,200 π', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80', tag: 'Luxury' },
  { city: 'Tokyo',    country: 'Japan',     price: '980 π',   img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80', tag: 'Culture' },
  { city: 'Paris',    country: 'France',    price: '1,100 π', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', tag: 'Romance' },
  { city: 'Maldives', country: 'Maldives',  price: '2,400 π', img: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80', tag: 'Beach' },
  { city: 'New York', country: 'USA',       price: '1,350 π', img: 'https://images.unsplash.com/photo-1546436836-07a91091f160?w=800&q=80', tag: 'Urban' },
  { city: 'Bali',     country: 'Indonesia', price: '750 π',   img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80', tag: 'Nature' },
];

const TICKER_ITEMS = ['Dubai','Tokyo','Paris','Maldives','New York','Bali','London','Barcelona','Singapore','Cairo','Sydney','Istanbul'];

export function PopularDestinations({ locale }: { locale: string }) {
  const tr = t(locale);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.06 }
    );
    sectionRef.current?.querySelectorAll('.vg-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} style={{ background: 'var(--vg-bg-surface)', padding: 'clamp(4rem,8vw,7rem) 0' }}>

      {/* Header */}
      <div style={{ padding: '0 clamp(1.5rem,7vw,5rem)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="vg-overline vg-reveal" style={{ marginBottom: '0.9rem' }}>
            {tr.destinations.sectionTag}
          </div>
          <h2 className="vg-display vg-reveal d1" style={{ fontSize: 'clamp(2rem,5vw,3.8rem)' }}>
            {tr.destinations.sectionTitle1} <em className="vg-italic">{tr.destinations.sectionTitle2}</em>
          </h2>
        </div>
        <Link href={`/${locale}/hotels`} className="vg-btn-outline vg-reveal d2" style={{ textDecoration: 'none' }}>
          {tr.destinations.viewAll} <ArrowRight size={12} />
        </Link>
      </div>

      {/* Grid */}
      <div style={{ padding: '0 clamp(1.5rem,7vw,5rem)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1px', background: 'var(--vg-border)' }}>
        {DESTINATIONS.map((dest, i) => (
          <TiltCard key={dest.city} className={`vg-reveal d${(i % 4) + 1}`} style={{ display: 'block' }}>
            <Link
              href={`/${locale}/hotels?city=${dest.city}`}
              className="vg-hotel-card"
              style={{ height: '280px', display: 'block', textDecoration: 'none', position: 'relative', overflow: 'hidden' }}
            >
              {/*
                FIX: removed inline style={{ filter: '...' }} so the CSS class
                vg-hotel-thumb can apply its own filter via --vg-thumb-filter variable
                which is brightness(0.72) in light mode vs brightness(0.48) in dark mode
              */}
              <img src={dest.img} alt={dest.city} className="vg-hotel-thumb" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />

              <div className="vg-price-tag">{dest.price}</div>

              <div style={{ position: 'absolute', top: '1.1rem', left: '1.1rem', background: 'var(--vg-gold-dim)', border: '1px solid var(--vg-gold-border)', padding: '0.2rem 0.6rem', fontFamily: 'var(--font-space-mono)', fontSize: '0.44rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--vg-gold)', zIndex: 2 }}>
                {dest.tag}
              </div>

              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(3,2,10,0.9) 0%, transparent 100%)', padding: '2rem 1.2rem 1.1rem', zIndex: 2 }}>
                <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.6rem', fontWeight: 300, color: '#F2EEE6', lineHeight: 1 }}>
                  {dest.city}
                </div>
                <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.46rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(242,238,230,0.55)', marginTop: '0.3rem' }}>
                  {dest.country}
                </div>
              </div>
            </Link>
          </TiltCard>
        ))}
      </div>

      {/* Ticker */}
      <div className="vg-ticker-wrap" style={{ marginTop: '3rem' }}>
        <div className="vg-ticker-inner">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="vg-ticker-item"><span className="tag">◆</span>{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
