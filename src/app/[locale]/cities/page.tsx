'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Hotel, Star } from 'lucide-react';

function SkeletonCard() {
  return (
    <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', overflow: 'hidden' }}>
      <div style={{ height: '220px', background: 'var(--vg-bg-surface)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent 0%,rgba(201,162,39,0.06) 50%,transparent 100%)', animation: 'shimmer 1.8s infinite' }} />
      </div>
      <div style={{ padding: '1rem' }}>
        {[60, 40].map((w, i) => (
          <div key={i} style={{ height: '9px', background: 'var(--vg-bg-surface)', marginBottom: '0.5rem', width: `${w}%`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent 0%,rgba(201,162,39,0.06) 50%,transparent 100%)', animation: `shimmer 1.8s infinite ${i * 0.2}s` }} />
          </div>
        ))}
      </div>
      <style>{`@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}`}</style>
    </div>
  );
}

export default function CitiesPage() {
  const { locale } = useParams();
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cities')
      .then(r => r.json())
      .then(d => { setCities(Array.isArray(d) ? d : d.cities || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>

      {/* Header */}
      <div style={{ background: 'var(--vg-bg-surface)', borderBottom: '1px solid var(--vg-border)', padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,7vw,5rem)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', background: 'radial-gradient(ellipse at right top, rgba(201,162,39,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="vg-overline" style={{ marginBottom: '1rem' }}>Destinations</div>
        <h1 className="vg-display" style={{ fontSize: 'clamp(2rem,5vw,3.8rem)', marginBottom: '0.5rem' }}>
          All <em className="vg-italic">Cities</em>
        </h1>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.88rem', color: 'var(--vg-text-2)' }}>
          Browse all available destinations
        </p>
      </div>

      <div style={{ padding: 'clamp(2rem,5vw,4rem) clamp(1.5rem,7vw,5rem)' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1px', background: 'var(--vg-border)' }}>
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : cities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
            <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '3rem', color: 'var(--vg-text-3)' }}>No Cities Found</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1px', background: 'var(--vg-border)' }}>
            {cities.map((city: any) => (
              <Link key={city.id} href={`/${locale}/hotels?city=${city.name}`}
                style={{ textDecoration: 'none', display: 'block', background: 'var(--vg-bg-card)' }}
                className="vg-hotel-card">
                <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                  <Image
                    src={city.thumbnail || city.images?.[0] || 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600'}
                    alt={city.name} fill sizes="(max-width:768px)100vw,33vw"
                    className="vg-hotel-thumb" style={{ position: 'absolute' }}
                  />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem 1.2rem 0.8rem', background: 'linear-gradient(to top, rgba(3,2,10,0.9) 0%, transparent 100%)', zIndex: 2 }}>
                    <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300, color: '#F2EEE6', lineHeight: 1 }}>{city.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.3rem' }}>
                      <MapPin size={11} color="rgba(242,238,230,0.5)" />
                      <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.42rem', letterSpacing: '0.15em', color: 'rgba(242,238,230,0.5)' }}>{city.country}</span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Hotel size={12} color="var(--vg-text-3)" />
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', color: 'var(--vg-text-3)' }}>
                      {city._count?.hotels || 0} Hotels
                    </span>
                  </div>
                  {city.rating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Star size={11} style={{ color: 'var(--vg-star)', fill: 'var(--vg-star)' }} />
                      <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.68rem', color: 'var(--vg-gold)' }}>{city.rating}</span>
                    </div>
                  )}
                  <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.44rem', letterSpacing: '0.15em', color: 'var(--vg-gold)' }}>Explore →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
