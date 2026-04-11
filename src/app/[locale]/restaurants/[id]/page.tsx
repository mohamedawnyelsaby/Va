'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Star, Utensils, DollarSign, Clock, Heart, Share2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const PRICE_COLOR: Record<string, string> = { '$': '#10b981', '$$': '#C9A227', '$$$': '#f59e0b', '$$$$': '#ef4444' };
const PRICE_LABEL: Record<string, string> = { '$': 'Budget', '$$': 'Moderate', '$$$': 'Upscale', '$$$$': 'Fine Dining' };

export default function RestaurantDetailPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${params.id}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setRestaurant(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
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

  if (error || !restaurant) return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '60px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '3rem', color: 'var(--vg-text-3)', marginBottom: '1.5rem' }}>Not Found</div>
        <Link href={`/${locale}/restaurants`} className="vg-btn-outline" style={{ textDecoration: 'none' }}>← Restaurants</Link>
      </div>
    </div>
  );

  const cuisine = Array.isArray(restaurant.cuisine) ? restaurant.cuisine : [restaurant.cuisine].filter(Boolean);
  const priceColor = PRICE_COLOR[restaurant.priceRange] || 'var(--vg-gold)';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>

      {/* Back nav */}
      <div style={{ padding: '1.2rem clamp(1.5rem,7vw,5rem)', borderBottom: '1px solid var(--vg-border)', background: 'var(--vg-bg-surface)' }}>
        <Link href={`/${locale}/restaurants`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontFamily: 'var(--font-space-mono)', fontSize: '0.46rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--vg-text-3)', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--vg-gold)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--vg-text-3)'}>
          <ArrowLeft size={13} /> Back to Restaurants
        </Link>
      </div>

      {/* Hero */}
      <div style={{ position: 'relative', height: 'clamp(260px,45vw,480px)', overflow: 'hidden' }}>
        <Image
          src={restaurant.thumbnail || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'}
          alt={restaurant.name} fill style={{ objectFit: 'cover', filter: 'brightness(0.48) saturate(0.65)' }} priority
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(3,2,10,0.92) 0%, transparent 55%)' }} />

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem clamp(1.5rem,7vw,5rem)', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              {cuisine[0] && (
                <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.44rem', letterSpacing: '0.2em', textTransform: 'uppercase', background: 'var(--vg-gold-dim)', border: '1px solid var(--vg-gold-border)', color: 'var(--vg-gold)', padding: '0.2rem 0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.8rem' }}>
                  <Utensils size={9} /> {cuisine[0]}
                </div>
              )}
              <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.8rem,4vw,3.2rem)', fontWeight: 300, color: '#F2EEE6', lineHeight: 1, marginBottom: '0.6rem' }}>
                {restaurant.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={13} color="rgba(242,238,230,0.6)" />
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'rgba(242,238,230,0.6)' }}>
                    {restaurant.city}, {restaurant.country}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Star size={13} style={{ color: 'var(--vg-star)', fill: 'var(--vg-star)' }} />
                  <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.78rem', color: 'var(--vg-gold)' }}>{restaurant.rating?.toFixed(1)}</span>
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.74rem', color: 'rgba(242,238,230,0.45)' }}>({restaurant.reviewCount || 0})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.8rem', color: priceColor }}>{restaurant.priceRange}</span>
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.76rem', color: 'rgba(242,238,230,0.5)' }}>{PRICE_LABEL[restaurant.priceRange]}</span>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: '2rem', padding: '2.5rem clamp(1.5rem,7vw,5rem)', maxWidth: '1200px', margin: '0 auto' }}
        className="rest-grid">
        <style>{`@media(max-width:800px){.rest-grid{grid-template-columns:1fr!important}}`}</style>

        {/* Left */}
        <div>
          <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', padding: '2rem', marginBottom: '1px' }}>
            <div className="vg-overline" style={{ marginBottom: '1rem' }}>About</div>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.88rem', color: 'var(--vg-text-2)', lineHeight: 1.85, margin: 0 }}>
              {restaurant.description || 'No description available.'}
            </p>
          </div>

          {/* Info chips */}
          <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', borderTop: 'none', padding: '1.5rem 2rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {cuisine.length > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.42rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--vg-text-3)', marginBottom: '0.4rem' }}>Cuisine</div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {cuisine.map((c: string) => (
                    <span key={c} style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', color: 'var(--vg-text-2)', background: 'var(--vg-bg-surface)', border: '1px solid var(--vg-border)', padding: '0.25rem 0.7rem' }}>{c}</span>
                  ))}
                </div>
              </div>
            )}
            {restaurant.openingHours && (
              <div>
                <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.42rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--vg-text-3)', marginBottom: '0.4rem' }}>Opening Hours</div>
                <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'var(--vg-text-2)' }}>{restaurant.openingHours}</div>
              </div>
            )}
            {restaurant.features?.length > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.42rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--vg-text-3)', marginBottom: '0.4rem' }}>Features</div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {restaurant.features.map((f: string) => (
                    <span key={f} style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.76rem', color: 'var(--vg-gold)', background: 'var(--vg-gold-dim)', border: '1px solid var(--vg-gold-border)', padding: '0.2rem 0.6rem' }}>{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right — reservation card */}
        <div>
          <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-gold-border)', position: 'sticky', top: '80px' }}>
            <div style={{ height: '2px', background: 'linear-gradient(to right, var(--vg-gold), var(--vg-gold-2))' }} />
            <div style={{ padding: '1.8rem' }}>
              <div className="vg-overline" style={{ marginBottom: '1.2rem' }}>Make a Reservation</div>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '1.4rem', color: priceColor }}>{restaurant.priceRange || '$$'}</span>
                <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.84rem', color: 'var(--vg-text-3)' }}>{PRICE_LABEL[restaurant.priceRange] || 'Moderate'}</span>
              </div>

              <div style={{ height: '1px', background: 'var(--vg-border)', marginBottom: '1.5rem' }} />

              {/* Details */}
              {restaurant.reservationRequired !== undefined && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--vg-text-3)' }}>Reservation</span>
                  <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.5rem', letterSpacing: '0.12em', color: restaurant.reservationRequired ? 'var(--vg-gold)' : '#10b981' }}>
                    {restaurant.reservationRequired ? 'REQUIRED' : 'NOT REQUIRED'}
                  </span>
                </div>
              )}
              {restaurant.dressCode && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--vg-text-3)' }}>Dress Code</span>
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--vg-text-2)' }}>{restaurant.dressCode}</span>
                </div>
              )}

              <div style={{ height: '1px', background: 'var(--vg-border)', marginBottom: '1.5rem' }} />

              <button className="vg-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '0.5rem' }}>
                Reserve a Table
              </button>

              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.7rem', color: 'var(--vg-text-3)', textAlign: 'center', marginTop: '0.8rem' }}>
                Confirm via Pi Network · Instant booking
              </p>

              <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, var(--vg-gold), transparent)', marginTop: '1.5rem', opacity: 0.5 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
