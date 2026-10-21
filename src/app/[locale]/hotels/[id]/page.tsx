// PATH: src/app/[locale]/hotels/[id]/page.tsx
// FIX: Hero image filter now uses CSS variable --vg-hero-filter
//      → brightness(0.58) in light mode, brightness(0.50) in dark mode (via globals.css)
// FIX: Thumbnail strip image filter also uses CSS variable
'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { MapPin, Star, Heart, Share2, Calendar, CalendarCheck, CalendarDays, Users, BedDouble, Lock, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { VG, inputBase, inputFocus, inputBlur, monoLabel } from '@/lib/tokens';
import { ImageLightbox, useImageLightbox } from '@/components/ui/ImageLightbox';
import { ReviewModal } from '@/components/ui/ReviewModal';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { RecentlyViewed } from '@/components/ui/RecentlyViewed';
import { addToRecentlyViewed } from '@/components/ui/Breadcrumb';
import { useFavorite } from '@/hooks/use-favorite';
import { AmenityGrid } from '@/components/hotel/AmenityGrid';
import { ReviewsSection } from '@/components/ui/ReviewsSection';

function Spinner() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '1px solid var(--vg-gold-border)', borderTop: '1px solid var(--vg-gold)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <div style={{ ...monoLabel, letterSpacing: VG.tracking.wide, textAlign: 'center' }}>Loading Hotel</div>
      </div>
      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
    </div>
  );
}

/** "Fri, 24 Oct → Sun, 26 Oct" in the page language. Parsed as local dates so
 *  the day can't shift by a timezone offset. */
function formatStay(checkIn: string, checkOut: string, locale: string): string {
  const fmt = (iso: string) => {
    const d = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(d.getTime())) {return iso;}
    try {
      return d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
    } catch {
      return d.toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' });
    }
  };
  return `${fmt(checkIn)} → ${fmt(checkOut)}`;
}

interface RoomType {
  type: string;
  description?: string;
  price: number;
}

interface HotelReview {
  id: string;
  user?: { name?: string };
  rating: number;
  title?: string | null;
  comment: string;
  createdAt: string;
}

interface HotelDetail {
  id: string;
  name: string;
  description: string;
  city: string;
  country: string;
  currency: string;
  pricePerNight: number;
  amenities: string[];
  images: string[];
  thumbnail?: string | null;
  rating: number;
  reviewCount: number;
  starRating: number;
  roomTypes?: RoomType[];
  reviews?: HotelReview[];
  cityRelation?: { name: string; country: string };
}

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const locale = (params.locale as string) || 'en';

  const [hotel,        setHotel]        = useState<HotelDetail | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [reviewOpen,   setReviewOpen]   = useState(false);
  const [reviewsKey, setReviewsKey] = useState(0);
  const { isFavorited: isFav, toggle: toggleFavorite, pending: favPending } = useFavorite(hotel?.id, 'hotel');
  const [bookingData,  setBookingData]  = useState({ checkIn: '', checkOut: '', guests: 1, rooms: 1 });

  const lightbox = useImageLightbox([]);

  // Is the booking card on screen? (drives the mobile sticky CTA)
  const [bookingCardVisible, setBookingCardVisible] = useState(false);
  useEffect(() => {
    const el = document.getElementById('booking-card');
    if (!el || typeof IntersectionObserver === 'undefined') {return;}
    const io = new IntersectionObserver(([entry]) => setBookingCardVisible(entry.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [loading, hotel?.id]);

  const scrollToBooking = () =>
    document.getElementById('booking-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const fetchHotel = useCallback(async () => {
    try {
      const res = await fetch(`/api/hotels/${params.id}`);
      if (!res.ok) {throw new Error('Not found');}
      const data = await res.json();
      setHotel(data);
      if (data.roomTypes?.length > 0) {setSelectedRoom(data.roomTypes[0]);}
      addToRecentlyViewed({
        id: data.id, type: 'hotel', name: data.name, thumbnail: data.thumbnail,
        price: data.pricePerNight, currency: data.currency, rating: data.rating,
        city: data.cityRelation?.name || data.city,
      });
    } catch {
      toast({ title: 'Error', description: 'Failed to load hotel', variant: 'destructive' });
    } finally { setLoading(false); }
  }, [params.id, toast]);

  useEffect(() => { fetchHotel(); }, [fetchHotel]);

  const toggleFav = async () => {
    if (!hotel) {return;}
    const result = await toggleFavorite();
    if (result.requiresAuth) {
      toast({ title: 'Sign in to save favorites', variant: 'default' });
      return;
    }
    if (!result.ok) {
      toast({ title: 'Something went wrong', variant: 'destructive' });
      return;
    }
    toast({ title: result.favorited ? 'Saved to favorites' : 'Removed from favorites', variant: result.favorited ? 'success' : 'default' });
  };

  const handleShare = () => {
    navigator.share?.({ title: hotel?.name, url: window.location.href }).catch(() => {
      navigator.clipboard?.writeText(window.location.href);
      toast({ title: 'Link copied!' });
    });
  };

  const handleBooking = () => {
    if (!hotel) {return;}
    if (!bookingData.checkIn || !bookingData.checkOut) {
      toast({ title: 'Required', description: 'Please select dates', variant: 'destructive' }); return;
    }
    const q = new URLSearchParams({
      itemId: hotel.id, itemType: 'Hotel',
      roomType: selectedRoom?.type || 'Standard',
      checkIn: bookingData.checkIn, checkOut: bookingData.checkOut,
      guests: bookingData.guests.toString(), rooms: bookingData.rooms.toString(),
    });
    router.push(`/${locale}/booking?${q}`);
  };

  const today  = new Date().toISOString().split('T')[0];
  const nights = bookingData.checkIn && bookingData.checkOut
    ? Math.max(1, Math.ceil((new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / 86400000))
    : 0;
  const pricePerNight = selectedRoom?.price || hotel?.pricePerNight || 0;
  const subtotal      = pricePerNight * nights * bookingData.rooms;
  const total         = subtotal * 1.1;

  if (loading) {return <Spinner />;}
  if (!hotel) {return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '60px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '3rem', color: 'var(--vg-text-3)', marginBottom: '1rem' }}>Hotel Not Found</div>
        <Link href={`/${locale}/hotels`} className="vg-btn-outline" style={{ textDecoration: 'none' }}>← Back to Hotels</Link>
      </div>
    </div>
  );}

  const images = hotel.images?.length > 0 ? hotel.images : [hotel.thumbnail].filter((img): img is string => Boolean(img));

  return (
    <div className="hotel-detail-page" style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>

      {lightbox.open && (
        <ImageLightbox images={images} initialIndex={lightbox.index} alt={hotel.name} onClose={lightbox.close} />
      )}

      <ReviewModal isOpen={reviewOpen} onClose={() => { setReviewOpen(false); setReviewsKey((k) => k + 1); }} itemId={hotel.id} itemName={hotel.name} itemType="hotel" />

      {/* Back nav + Breadcrumb */}
      <div style={{ padding: `1rem ${VG.section.x}`, borderBottom: '1px solid var(--vg-border)', background: 'var(--vg-bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <Breadcrumb locale={locale} items={[
          { label: 'Hotels',  href: `/${locale}/hotels` },
          { label: hotel.cityRelation?.name || hotel.city || 'City', href: `/${locale}/hotels?city=${hotel.cityRelation?.name || hotel.city}` },
          { label: hotel.name },
        ]} />
        <button onClick={handleShare} style={{ background: 'none', border: '1px solid var(--vg-border)', padding: '0.35rem 0.7rem', cursor: 'pointer', color: 'var(--vg-text-3)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro, letterSpacing: '0.15em', textTransform: 'uppercase', transition: 'color 0.2s, border-color 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--vg-gold)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--vg-gold-border)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--vg-text-3)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--vg-border)'; }}
        >
          <Share2 size={11} /> Share
        </button>
      </div>

      {/* Gallery — FIX: uses CSS variable --vg-hero-filter for light/dark mode */}
      <div style={{ position: 'relative', height: 'clamp(280px,50vw,520px)', overflow: 'hidden', cursor: 'pointer' }}
        onClick={() => lightbox.openAt(0)} title="Click to view gallery">

        {/* FIX: objectFit cover, filter via CSS class for light mode adaptation */}
        <Image src={images[0] || hotel.thumbnail || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200'} alt={hotel.name} fill
          style={{ objectFit: 'cover', filter: 'var(--vg-hero-filter, brightness(0.55) saturate(0.65))' }} priority />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(3,2,10,0.9) 0%, transparent 50%)' }} />

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', display: 'flex', gap: '0.35rem', zIndex: 3 }}>
            {images.slice(1, 4).map((img: string, i: number) => (
              <div
                key={i}
                onClick={e => { e.stopPropagation(); lightbox.openAt(i + 1); }}
                style={{ width: '52px', height: '38px', border: '1px solid rgba(242,238,230,0.3)', overflow: 'hidden', position: 'relative', cursor: 'pointer', transition: 'border-color 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--vg-gold)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(242,238,230,0.3)'}
              >
                {/* FIX: thumbnail strip uses slightly lighter filter in light mode */}
                <Image src={img} alt={`Image ${i + 2}`} fill
                  style={{ objectFit: 'cover', filter: 'var(--vg-thumb-filter, brightness(0.60) saturate(0.65))' }} sizes="52px" />
                {i === 2 && images.length > 4 && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(3,2,10,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-space-mono)', fontSize: '0.5rem' }}>
                    +{images.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Expand hint */}
        <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', zIndex: 3, background: 'rgba(3,2,10,0.65)', border: '1px solid var(--vg-gold-border)', padding: '0.3rem 0.8rem', fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro, color: 'var(--vg-gold)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          {images.length} Photos ↗
        </div>

        {/* Hotel info overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: `2rem ${VG.section.x}`, zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', gap: '2px', marginBottom: '0.5rem' }}>
                {Array.from({ length: hotel.starRating || 0 }).map((_, s: number) => (
                  <span key={s} style={{ color: 'var(--vg-star)', fontSize: '0.8rem' }}>★</span>
                ))}
              </div>
              <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 300, color: '#F2EEE6', lineHeight: 1, marginBottom: '0.5rem' }}>
                {hotel.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={13} color="rgba(242,238,230,0.7)" />
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'rgba(242,238,230,0.7)' }}>
                    {hotel.cityRelation?.name || hotel.city}, {hotel.cityRelation?.country || hotel.country}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Star size={13} style={{ color: 'var(--vg-star)', fill: 'var(--vg-star)' }} />
                  <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: VG.font.small, color: 'var(--vg-gold)' }}>{hotel.rating?.toFixed(1)}</span>
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'rgba(242,238,230,0.5)' }}>({hotel.reviewCount} reviews)</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={e => { e.stopPropagation(); toggleFav(); }}
                disabled={favPending}
                aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                style={{ width: '40px', height: '40px', background: 'rgba(3,2,10,0.7)', border: '1px solid var(--vg-gold-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isFav ? 'var(--vg-gold)' : 'rgba(242,238,230,0.6)', transition: 'color 0.2s' }}>
                <Heart size={15} style={{ fill: isFav ? 'var(--vg-gold)' : 'none', transition: 'fill 0.2s' }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: '2rem', padding: `2.5rem ${VG.section.x}`, maxWidth: '1400px', margin: '0 auto' }}
        className="hotel-detail-grid">
        <style>{'.hotel-mobile-cta{display:none}@media(max-width:900px){.hotel-detail-grid{grid-template-columns:1fr!important}.hotel-mobile-cta{display:flex}.hotel-detail-page{padding-bottom:76px}}'}</style>

        {/* Left */}
        <div>
          {/* Description */}
          <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', padding: '2rem', marginBottom: '1px' }}>
            <div className="vg-overline" style={{ marginBottom: '1rem' }}>About This Hotel</div>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.body, color: 'var(--vg-text-2)', lineHeight: 1.85, margin: 0 }}>
              {hotel.description}
            </p>
          </div>

          {/* Amenities */}
          {hotel.amenities?.length > 0 && (
            <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', borderTop: 'none', padding: '2rem', marginBottom: '1px' }}>
              <div className="vg-overline" style={{ marginBottom: '1.2rem' }}>Amenities</div>
              <AmenityGrid amenities={hotel.amenities} />
            </div>
          )}

          {/* Room types */}
          {(hotel.roomTypes?.length ?? 0) > 0 && (
            <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', borderTop: 'none', padding: '2rem', marginBottom: '1px' }}>
              <div className="vg-overline" style={{ marginBottom: '1.2rem' }}>Select Room Type</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--vg-border)' }}>
                {hotel.roomTypes?.map((room: RoomType) => (
                  <div key={room.type} onClick={() => setSelectedRoom(room)}
                    style={{
                      background: selectedRoom?.type === room.type ? 'var(--vg-gold-dim)' : 'var(--vg-bg-card)',
                      borderLeft: `3px solid ${selectedRoom?.type === room.type ? 'var(--vg-gold)' : 'transparent'}`,
                      padding: '1.2rem 1.4rem', cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: VG.transition.normal,
                    }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.15rem', fontWeight: 300, color: selectedRoom?.type === room.type ? 'var(--vg-gold)' : 'var(--vg-text)', marginBottom: '0.3rem' }}>{room.type}</div>
                      <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'var(--vg-text-3)' }}>{room.description}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="vg-stat-num" style={{ fontSize: '1.3rem' }}>{formatCurrency(room.price, hotel.currency)}</div>
                      <div style={{ ...monoLabel, color: 'var(--vg-text-3)' }}>PER NIGHT</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews (loaded from /api/reviews: the hotel endpoint does not include them) */}
          <ReviewsSection
            itemId={hotel.id}
            itemType="hotel"
            label="Guest Reviews"
            emptyHint="Be the first to review this hotel."
            locale={locale}
            onWrite={() => setReviewOpen(true)}
            refreshKey={reviewsKey}
          />

          {/* Recently Viewed */}
          <div style={{ marginTop: '2.5rem' }}>
            <RecentlyViewed locale={locale} exclude={hotel.id} />
          </div>
        </div>

        {/* Sticky booking card */}
        <div>
          <div id="booking-card" style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-gold-border)', position: 'sticky', top: '80px', scrollMarginTop: '80px' }}>
            <div style={{ height: '2px', background: 'linear-gradient(to right, var(--vg-gold), var(--vg-gold-2))' }} />
            <div style={{ padding: '1.8rem' }}>
              <div className="vg-overline" style={{ marginBottom: '1.2rem' }}>Book Your Stay</div>

              <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--vg-border)' }}>
                <span className="vg-stat-num" style={{ fontSize: '2rem' }}>{formatCurrency(pricePerNight, hotel.currency)}</span>
                <span style={{ ...monoLabel, marginLeft: '0.5rem', color: 'var(--vg-text-3)' }}>/ NIGHT</span>
              </div>

              {/* Check-in */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ ...monoLabel, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <Calendar size={14} aria-hidden /> Check-in
                </label>
                <input type="date" lang={locale} min={today} value={bookingData.checkIn}
                  onChange={e => setBookingData({ ...bookingData, checkIn: e.target.value })}
                  style={inputBase}
                  onFocus={e => Object.assign(e.target.style, inputFocus)}
                  onBlur={e => Object.assign(e.target.style, inputBlur)} />
              </div>

              {/* Check-out */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ ...monoLabel, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <Calendar size={14} aria-hidden /> Check-out
                </label>
                <input type="date" lang={locale} min={bookingData.checkIn || today} value={bookingData.checkOut}
                  onChange={e => setBookingData({ ...bookingData, checkOut: e.target.value })}
                  style={inputBase}
                  onFocus={e => Object.assign(e.target.style, inputFocus)}
                  onBlur={e => Object.assign(e.target.style, inputBlur)} />
              </div>

              {/* Guests + Rooms */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ ...monoLabel, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <Users size={14} aria-hidden /> Guests
                  </label>
                  <input type="number" min={1} max={20} value={bookingData.guests}
                    onChange={e => setBookingData({ ...bookingData, guests: parseInt(e.target.value) || 1 })}
                    style={inputBase}
                    onFocus={e => Object.assign(e.target.style, inputFocus)}
                    onBlur={e => Object.assign(e.target.style, inputBlur)} />
                </div>
                <div>
                  <label style={{ ...monoLabel, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <BedDouble size={14} aria-hidden /> Rooms
                  </label>
                  <input type="number" min={1} max={10} value={bookingData.rooms}
                    onChange={e => setBookingData({ ...bookingData, rooms: parseInt(e.target.value) || 1 })}
                    style={inputBase}
                    onFocus={e => Object.assign(e.target.style, inputFocus)}
                    onBlur={e => Object.assign(e.target.style, inputBlur)} />
                </div>
              </div>

              {/* Stay summary */}
              {nights > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'var(--vg-text-2)' }}>
                  <CalendarDays size={14} color="var(--vg-gold)" aria-hidden style={{ flexShrink: 0 }} />
                  <span>{formatStay(bookingData.checkIn, bookingData.checkOut, locale)} · {nights} {nights === 1 ? 'night' : 'nights'}</span>
                </div>
              )}

              {/* Price breakdown */}
              {nights > 0 && (
                <div style={{ background: 'var(--vg-bg-surface)', padding: '1rem', marginBottom: '1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'var(--vg-text-3)' }}>
                      {formatCurrency(pricePerNight, hotel.currency)} × {nights} {nights === 1 ? 'night' : 'nights'} × {bookingData.rooms} {bookingData.rooms === 1 ? 'room' : 'rooms'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'var(--vg-text-2)' }}>{formatCurrency(subtotal, hotel.currency)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'var(--vg-text-3)' }}>Service fee (10%)</span>
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'var(--vg-text-2)' }}>{formatCurrency(subtotal * 0.1, hotel.currency)}</span>
                  </div>
                  <div style={{ height: '1px', background: 'var(--vg-border)', margin: '0.5rem 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ ...monoLabel }}>TOTAL</span>
                    <span className="vg-stat-num" style={{ fontSize: '1.1rem' }}>{formatCurrency(total, hotel.currency)}</span>
                  </div>
                </div>
              )}

              <button onClick={handleBooking} className="vg-btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', padding: '1.1rem', fontSize: VG.font.button, letterSpacing: VG.tracking.normal }}>
                <CalendarCheck size={16} aria-hidden />
                {nights > 0 ? `Book Now · ${formatCurrency(total, hotel.currency)}` : 'Book Now'}
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.9rem', fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'var(--vg-text-3)', lineHeight: 1.5 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <Lock size={14} aria-hidden style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                  <span>Pay securely with Pi. The exact π amount is shown before you confirm.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <ShieldCheck size={14} aria-hidden style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                  <span>Free cancellation up to 24 hours before check-in</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: the booking card is the LAST block on small screens, so keep a
          sticky call-to-action above the bottom nav until the card is in view. */}
      {!bookingCardVisible && (
        <div className="hotel-mobile-cta" style={{ position: 'fixed', insetInline: 0, bottom: 'calc(var(--bnavH, 70px) + env(safe-area-inset-bottom, 0px))', zIndex: 150, alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--vg-bg-card)', borderTop: '1px solid var(--vg-gold-border)' }}>
          <div>
            <div style={{ ...monoLabel, marginBottom: '0.15rem' }}>{nights > 0 ? `${nights} ${nights === 1 ? 'night' : 'nights'}` : 'From'}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
              <span className="vg-stat-num" style={{ fontSize: '1.3rem' }}>{formatCurrency(nights > 0 ? total : pricePerNight, hotel.currency)}</span>
              {nights === 0 && <span style={{ ...monoLabel, color: 'var(--vg-text-3)' }}>/ NIGHT</span>}
            </div>
          </div>
          <button onClick={nights > 0 ? handleBooking : scrollToBooking} className="vg-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.4rem', whiteSpace: 'nowrap' }}>
            <CalendarCheck size={16} aria-hidden />
            {nights > 0 ? 'Book Now' : 'Select Dates'}
          </button>
        </div>
      )}
    </div>
  );
}
