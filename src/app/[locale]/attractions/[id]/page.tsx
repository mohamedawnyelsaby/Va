// PATH: src/app/[locale]/attractions/[id]/page.tsx
// UPDATED: + Breadcrumb, + ReviewModal, + addToRecentlyViewed
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Star, Clock, Ticket, Heart, Share2, ArrowLeft, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { VG, monoLabel } from '@/lib/tokens';
import { ReviewModal } from '@/components/ui/ReviewModal';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { RecentlyViewed } from '@/components/ui/RecentlyViewed';
import { addToRecentlyViewed } from '@/components/ui/Breadcrumb';
import { ImageLightbox, useImageLightbox } from '@/components/ui/ImageLightbox';

export default function AttractionDetailPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const [attraction, setAttraction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const lightbox = useImageLightbox([]);

  useEffect(() => {
    fetch(`/api/attractions/${params.id}`)
      .then(r => r.json())
      .then(d => {
        setAttraction(d);
        setLoading(false);
        // Track
        addToRecentlyViewed({
          id: d.id, type: 'attraction', name: d.name,
          thumbnail: d.thumbnail, rating: d.rating,
          city: d.city?.name || d.city,
        });
        // Check fav
        try {
          const stored = JSON.parse(localStorage.getItem('va-favorites') || '[]');
          setIsFav(stored.some((f: any) => f.id === d.id));
        } catch {}
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const toggleFav = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('va-favorites') || '[]');
      const exists = stored.some((f: any) => f.id === attraction.id);
      const updated = exists
        ? stored.filter((f: any) => f.id !== attraction.id)
        : [...stored, { id: attraction.id, type: 'attraction' }];
      localStorage.setItem('va-favorites', JSON.stringify(updated));
      setIsFav(!exists);
    } catch {}
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '60px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '1px solid var(--vg-gold-border)', borderTop: '1px solid var(--vg-gold)', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 1rem' }} />
        <div style={{ ...monoLabel, textAlign: 'center' }}>Loading</div>
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

  const images = attraction.images?.length > 0 ? attraction.images : [attraction.thumbnail].filter(Boolean);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>

      {lightbox.open && (
        <ImageLightbox images={images} initialIndex={lightbox.index} alt={attraction.name} onClose={lightbox.close} />
      )}

      <ReviewModal isOpen={reviewOpen} onClose={() => setReviewOpen(false)} itemId={attraction.id} itemName={attraction.name} itemType="attraction" />

      {/* Breadcrumb nav */}
      <div style={{ padding: `1rem ${VG.section.x}`, borderBottom: '1px solid var(--vg-border)', background: 'var(--vg-bg-surface)' }}>
        <Breadcrumb locale={locale} items={[
          { label: 'Attractions', href: `/${locale}/attractions` },
          { label: attraction.category || 'Category', href: `/${locale}/attractions?category=${attraction.category}` },
          { label: attraction.name },
        ]} />
      </div>

      {/* Hero image — clickable */}
      <div style={{ position: 'relative', height: 'clamp(260px,45vw,480px)', overflow: 'hidden', cursor: 'pointer' }}
        onClick={() => lightbox.openAt(0)}>
        <Image src={attraction.thumbnail || 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200'}
          alt={attraction.name} fill style={{ objectFit: 'cover', filter: 'brightness(0.5) saturate(0.65)' }} priority />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(3,2,10,0.92) 0%, transparent 55%)' }} />

        {images.length > 1 && (
          <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', zIndex: 3, background: 'rgba(3,2,10,0.65)', border: '1px solid var(--vg-gold-border)', padding: '0.3rem 0.8rem', ...monoLabel, color: 'var(--vg-gold)' }}>
            {images.length} Photos ↗
          </div>
        )}

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: `2rem ${VG.section.x}`, zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              {attraction.category && (
                <div style={{ ...monoLabel, background: 'var(--vg-gold-dim)', border: '1px solid var(--vg-gold-border)', color: 'var(--vg-gold)', padding: '0.2rem 0.7rem', display: 'inline-block', marginBottom: '0.8rem' }}>
                  {attraction.category}
                </div>
              )}
              <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.8rem,4vw,3.2rem)', fontWeight: 300, color: '#F2EEE6', lineHeight: 1, marginBottom: '0.6rem' }}>
                {attraction.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={13} color="rgba(242,238,230,0.6)" />
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'rgba(242,238,230,0.6)' }}>
                    {attraction.city?.name || attraction.city}, {attraction.city?.country || attraction.country}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Star size={13} style={{ color: 'var(--vg-star)', fill: 'var(--vg-star)' }} />
                  <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: VG.font.small, color: 'var(--vg-gold)' }}>{attraction.rating?.toFixed(1)}</span>
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'rgba(242,238,230,0.45)' }}>({attraction.reviewCount || 0})</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={e => { e.stopPropagation(); toggleFav(); }} style={{ width: '40px', height: '40px', background: 'rgba(3,2,10,0.7)', border: '1px solid var(--vg-gold-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isFav ? 'var(--vg-gold)' : 'rgba(242,238,230,0.6)' }}>
                <Heart size={15} style={{ fill: isFav ? 'var(--vg-gold)' : 'none' }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: '2rem', padding: `2.5rem ${VG.section.x}`, maxWidth: '1200px', margin: '0 auto' }}
        className="attr-grid">
        <style>{`@media(max-width:800px){.attr-grid{grid-template-columns:1fr!important}}`}</style>

        {/* Left */}
        <div>
          <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', padding: '2rem', marginBottom: '1px' }}>
            <div className="vg-overline" style={{ marginBottom: '1rem' }}>About This Attraction</div>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.body, color: 'var(--vg-text-2)', lineHeight: 1.85, margin: 0 }}>
              {attraction.description || 'No description available.'}
            </p>
          </div>

          {(attraction.duration || attraction.openingHours) && (
            <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', borderTop: 'none', padding: '1.5rem 2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              {attraction.duration && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div className="vg-feat-icon" style={{ width: '30px', height: '30px' }}><Clock size={12} /></div>
                  <div>
                    <div style={{ ...monoLabel, marginBottom: '0.2rem' }}>Duration</div>
                    <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'var(--vg-text-2)' }}>{attraction.duration}</div>
                  </div>
                </div>
              )}
              {attraction.openingHours && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div className="vg-feat-icon" style={{ width: '30px', height: '30px' }}><Clock size={12} /></div>
                  <div>
                    <div style={{ ...monoLabel, marginBottom: '0.2rem' }}>Hours</div>
                    <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'var(--vg-text-2)' }}>{attraction.openingHours}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {attraction.accessibility?.length > 0 && (
            <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', borderTop: 'none', padding: '1.5rem 2rem' }}>
              <div className="vg-overline" style={{ marginBottom: '0.8rem' }}>Accessibility</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {attraction.accessibility.map((a: string) => (
                  <span key={a} style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'var(--vg-text-2)', background: 'var(--vg-bg-surface)', border: '1px solid var(--vg-border)', padding: '0.3rem 0.8rem' }}>{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Review section */}
          <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', borderTop: 'none', padding: '1.5rem 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="vg-overline">Reviews</div>
              <button onClick={() => setReviewOpen(true)} className="vg-btn-outline" style={{ padding: '0.45rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MessageSquare size={12} /> Write Review
              </button>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem' }}>
            <RecentlyViewed locale={locale} exclude={attraction.id} />
          </div>
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
                  <div style={{ ...monoLabel, marginBottom: '1.8rem' }}>PER PERSON</div>
                </>
              ) : (
                <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: VG.font.small, letterSpacing: VG.tracking.tight, color: '#10b981', marginBottom: '1.8rem' }}>FREE ENTRY</div>
              )}

              <div style={{ height: '1px', background: 'var(--vg-border)', marginBottom: '1.5rem' }} />
              <button className="vg-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: VG.font.button }}>
                Book Experience
              </button>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'var(--vg-text-3)', textAlign: 'center', marginTop: '0.8rem', lineHeight: 1.6 }}>
                Instant confirmation · Free cancellation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
