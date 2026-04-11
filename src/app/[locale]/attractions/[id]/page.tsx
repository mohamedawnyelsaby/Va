'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Star, Clock, Ticket, Heart, Share2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default function AttractionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'en';
  const [attraction, setAttraction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    fetch(`/api/attractions/${params.id}`)
      .then(r => r.json())
      .then(d => { setAttraction(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '60px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '1px solid var(--vg-gold-border)', borderTop: '1px solid var(--vg-gold)', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 1rem' }} />
        <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.46rem', letterSpacing: '0.28em', color: 'var(--vg-text-3)', textTransform: 'uppercase' }}>Loading</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!attraction) return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '60px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '3rem', color: 'var(--vg-text-3)', marginBottom: '1.5rem' }}>Not Found</div>
        <Link href={`/${locale}/attractions`} className="vg-btn-outline" style={{ textDecoration: 'none' }}>← Attractions</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>

      {/* Back nav */}
      <div style={{ padding: '1.2rem clamp(1.5rem,7vw,5rem)', borderBottom: '1px solid var(--vg-border)', background: 'var(--vg-bg-surface)' }}>
        <Link href={`/${locale}/attractions`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontFamily: 'var(--font-space-mono)', fontSize: '0.46rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--vg-text-3)', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--vg-gold)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--vg-text-3)'}>
          <ArrowLeft size={13} /> Back to Attractions
        </Link>
      </div>

      {/* Hero image */}
      <div style={{ position: 'relative', height: 'clamp(260px,45vw,480px)', overflow: 'hidden' }}>
        <Image
          src={attraction.thumbnail || 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200'}
          alt={attraction.name} fill style={{ objectFit: 'cover', filter: 'brightness(0.5) saturate(0.65)' }} priority
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(3,2,10,0.92) 0%, transparent 55%)' }} />

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem clamp(1.5rem,7vw,5rem)', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              {attraction.category && (
                <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.44rem', letterSpacing: '0.2em', textTransform: 'uppercase', background: 'var(--vg-gold-dim)', border: '1px solid var(--vg-gold-border)', color: 'var(--vg-gold)', padding: '0.2rem 0.7rem', display: 'inline-block', marginBottom: '0.8rem' }}>
                  {attraction.category}
                </div>
              )}
              <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.8rem,4vw,3.2rem)', fontWeight: 300, color: '#F2EEE6', lineHeight: 1, marginBottom: '0.6rem' }}>
                {attraction.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={13} color="rgba(242,238,230,0.6)" />
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'rgba(242,238,230,0.6)' }}>
                    {attraction.city?.name || attraction.city}, {attraction.city?.country || attraction.country}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Star size={13} style={{ color: 'var(--vg-star)', fill: 'var(--vg-star)' }} />
                  <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.78rem', color: 'var(--vg-gold)' }}>{attraction.rating?.toFixed(1)}</span>
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.74rem', color: 'rgba(242,238,230,0.45)' }}>({attraction.reviewCount || 0})</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setIsFav(!isFav)} style={{ width: '40px', height: '40px', background: 'rgba(3,2,10,0.7)', border: '1px solid var(--vg-gold-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isFav ? 'var(--vg-gold)' : 'rgba(242,238,230,0.6)' }}>
                <Heart size={15} style={{ fill: isFav ? 'var(--vg-gold)' : 'none' }} />
              </button>
              <button style={{ width: '40px', height: '40px', background: 'rgba(3,2,10,0.7)', border: '1px solid var(--vg-gold-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(242,238,230,0.6)' }}>
                <Share2 size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: '2rem', padding: '2.5rem clamp(1.5rem,7vw,5rem)', maxWidth: '1200px', margin: '0 auto' }}
        className="attr-grid">
        <style>{`@media(max-width:800px){.attr-grid{grid-template-columns:1fr!important}}`}</style>

        {/* Left */}
        <div>
          <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', padding: '2rem', marginBottom: '1px' }}>
            <div className="vg-overline" style={{ marginBottom: '1rem' }}>About This Attraction</div>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.88rem', color: 'var(--vg-text-2)', lineHeight: 1.85, margin: 0 }}>
              {attraction.description || 'No description available.'}
            </p>
          </div>

          {/* Details row */}
          <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', borderTop: 'none', padding: '1.5rem 2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {attraction.duration && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div className="vg-feat-icon" style={{ width: '30px', height: '30px' }}><Clock size={12} /></div>
                <div>
                  <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.42rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--vg-text-3)', marginBottom: '0.2rem' }}>Duration</div>
                  <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.84rem', color: 'var(--vg-text-2)' }}>{attraction.duration}</div>
                </div>
              </div>
            )}
            {attraction.openingHours && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div className="vg-feat-icon" style={{ width: '30px', height: '30px' }}><Clock size={12} /></div>
                <div>
                  <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.42rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--vg-text-3)', marginBottom: '0.2rem' }}>Hours</div>
                  <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.84rem', color: 'var(--vg-text-2)' }}>{attraction.openingHours}</div>
                </div>
              </div>
            )}
          </div>

          {/* Accessibility */}
          {attraction.accessibility?.length > 0 && (
            <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', borderTop: 'none', padding: '1.5rem 2rem' }}>
              <div className="vg-overline" style={{ marginBottom: '0.8rem' }}>Accessibility</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {attraction.accessibility.map((a: string) => (
                  <span key={a} style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', color: 'var(--vg-text-2)', background: 'var(--vg-bg-surface)', border: '1px solid var(--vg-border)', padding: '0.3rem 0.8rem' }}>{a}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — booking card */}
        <div>
          <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-gold-border)', position: 'sticky', top: '80px' }}>
            <div style={{ height: '2px', background: 'linear-gradient(to right, var(--vg-gold), var(--vg-gold-2))' }} />
            <div style={{ padding: '1.8rem' }}>
              <div className="vg-overline" style={{ marginBottom: '1.2rem' }}>Entry Details</div>

              {attraction.ticketPrice ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    <Ticket size={15} style={{ color: 'var(--vg-gold)' }} />
                    <span className="vg-stat-num" style={{ fontSize: '2rem' }}>{formatCurrency(attraction.ticketPrice, attraction.currency)}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.44rem', letterSpacing: '0.15em', color: 'var(--vg-text-3)', marginBottom: '1.8rem' }}>PER PERSON</div>
                </>
              ) : (
                <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.72rem', letterSpacing: '0.2em', color: '#10b981', marginBottom: '1.8rem' }}>FREE ENTRY</div>
              )}

              <div style={{ height: '1px', background: 'var(--vg-border)', marginBottom: '1.5rem' }} />

              <button className="vg-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '0.5rem' }}>
                Book Experience
              </button>

              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.7rem', color: 'var(--vg-text-3)', textAlign: 'center', marginTop: '0.8rem', lineHeight: 1.6 }}>
                Instant confirmation · Free cancellation
              </p>

              <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, var(--vg-gold), transparent)', marginTop: '1.5rem', opacity: 0.5 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
