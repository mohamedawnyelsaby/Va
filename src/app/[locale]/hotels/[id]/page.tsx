'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { MapPin, Star, Heart, Share2, Wifi, Coffee, Dumbbell, Utensils, Calendar, Users, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

function Spinner() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px', height: '40px', border: '1px solid var(--vg-gold-border)',
          borderTop: '1px solid var(--vg-gold)', borderRadius: '50%',
          animation: 'spin 1s linear infinite', margin: '0 auto 1rem',
        }} />
        <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.48rem', letterSpacing: '0.3em', color: 'var(--vg-text-3)', textTransform: 'uppercase' }}>
          Loading Hotel
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const AMENITY_ICONS: Record<string, any> = {
  WiFi: Wifi, Breakfast: Coffee, Gym: Dumbbell, Restaurant: Utensils, Pool: Coffee,
};

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const locale = (params.locale as string) || 'en';

  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImg, setCurrentImg] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [isFav, setIsFav] = useState(false);
  const [bookingData, setBookingData] = useState({ checkIn: '', checkOut: '', guests: 1, rooms: 1 });

  const fetchHotel = useCallback(async () => {
    try {
      const res = await fetch(`/api/hotels/${params.id}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setHotel(data);
      if (data.roomTypes?.length > 0) setSelectedRoom(data.roomTypes[0]);
    } catch {
      toast({ title: 'Error', description: 'Failed to load hotel', variant: 'destructive' });
    } finally { setLoading(false); }
  }, [params.id, toast]);

  useEffect(() => { fetchHotel(); }, [fetchHotel]);

  const handleBooking = () => {
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

  const today = new Date().toISOString().split('T')[0];

  const nights = bookingData.checkIn && bookingData.checkOut
    ? Math.max(1, Math.ceil((new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / 86400000))
    : 0;
  const pricePerNight = selectedRoom?.price || hotel?.pricePerNight || 0;
  const subtotal = pricePerNight * nights * bookingData.rooms;
  const total = subtotal * 1.1;

  if (loading) return <Spinner />;
  if (!hotel) return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '60px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '3rem', color: 'var(--vg-text-3)', marginBottom: '1rem' }}>Hotel Not Found</div>
        <Link href={`/${locale}/hotels`} className="vg-btn-outline" style={{ textDecoration: 'none' }}>← Back to Hotels</Link>
      </div>
    </div>
  );

  const images = hotel.images?.length > 0 ? hotel.images : [hotel.thumbnail];

  const inputStyle = {
    width: '100%', boxSizing: 'border-box' as const,
    background: 'var(--vg-bg-surface)', border: '1px solid var(--vg-border)',
    padding: '0.75rem 0.85rem', fontFamily: 'var(--font-dm-sans)',
    fontSize: '0.84rem', color: 'var(--vg-text)', outline: 'none', transition: 'border-color 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>

      {/* Back nav */}
      <div style={{ padding: '1.2rem clamp(1.5rem,7vw,5rem)', borderBottom: '1px solid var(--vg-border)', background: 'var(--vg-bg-surface)' }}>
        <Link href={`/${locale}/hotels`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontFamily: 'var(--font-space-mono)', fontSize: '0.46rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--vg-text-3)', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--vg-gold)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--vg-text-3)'}>
          <ArrowLeft size={13} /> Back to Hotels
        </Link>
      </div>

      {/* Gallery */}
      <div style={{ position: 'relative', height: 'clamp(280px,50vw,520px)', overflow: 'hidden' }}>
        <Image src={images[currentImg] || hotel.thumbnail} alt={hotel.name} fill style={{ objectFit: 'cover', filter: 'brightness(0.55) saturate(0.7)' }} priority />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(3,2,10,0.9) 0%, transparent 50%)' }} />

        {/* Nav arrows */}
        {images.length > 1 && (<>
          <button onClick={() => setCurrentImg(i => i === 0 ? images.length - 1 : i - 1)}
            style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(3,2,10,0.7)', border: '1px solid var(--vg-gold-border)', width: '40px', height: '40px', cursor: 'pointer', color: 'var(--vg-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setCurrentImg(i => i === images.length - 1 ? 0 : i + 1)}
            style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(3,2,10,0.7)', border: '1px solid var(--vg-gold-border)', width: '40px', height: '40px', cursor: 'pointer', color: 'var(--vg-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
            <ChevronRight size={16} />
          </button>
          {/* Dots */}
          <div style={{ position: 'absolute', bottom: '8rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.4rem', zIndex: 3 }}>
            {images.map((_: any, i: number) => (
              <button key={i} onClick={() => setCurrentImg(i)} style={{ width: i === currentImg ? '20px' : '6px', height: '6px', background: i === currentImg ? 'var(--vg-gold)' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
            ))}
          </div>
        </>)}

        {/* Hotel info overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem clamp(1.5rem,7vw,5rem)', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', gap: '2px', marginBottom: '0.5rem' }}>
                {Array.from({ length: hotel.starRating || 0 }).map((_: any, s: number) => (
                  <span key={s} style={{ color: 'var(--vg-star)', fontSize: '0.8rem' }}>★</span>
                ))}
              </div>
              <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 300, color: '#F2EEE6', lineHeight: 1, marginBottom: '0.5rem' }}>
                {hotel.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={13} color="rgba(242,238,230,0.7)" />
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'rgba(242,238,230,0.7)' }}>
                    {hotel.city?.name || hotel.city}, {hotel.city?.country || hotel.country}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Star size={13} style={{ color: 'var(--vg-star)', fill: 'var(--vg-star)' }} />
                  <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.8rem', color: 'var(--vg-gold)' }}>{hotel.rating?.toFixed(1)}</span>
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.76rem', color: 'rgba(242,238,230,0.5)' }}>({hotel.reviewCount} reviews)</span>
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

      {/* Main content */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: '2rem', padding: '2.5rem clamp(1.5rem,7vw,5rem)', maxWidth: '1400px', margin: '0 auto' }}
        className="hotel-detail-grid">
        <style>{`@media(max-width:900px){.hotel-detail-grid{grid-template-columns:1fr!important}}`}</style>

        {/* Left column */}
        <div>
          {/* Description */}
          <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', padding: '2rem', marginBottom: '1px' }}>
            <div className="vg-overline" style={{ marginBottom: '1rem' }}>About This Hotel</div>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.88rem', color: 'var(--vg-text-2)', lineHeight: 1.8 }}>
              {hotel.description}
            </p>
          </div>

          {/* Amenities */}
          {hotel.amenities?.length > 0 && (
            <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', borderTop: 'none', padding: '2rem', marginBottom: '1px' }}>
              <div className="vg-overline" style={{ marginBottom: '1.2rem' }}>Amenities</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.5rem' }}>
                {hotel.amenities.map((a: string) => {
                  const Icon = AMENITY_ICONS[a] || Wifi;
                  return (
                    <div key={a} className="vg-pi-step" style={{ padding: '0.65rem 0.8rem' }}>
                      <Icon size={13} color="var(--vg-gold)" />
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--vg-text-2)' }}>{a}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Room types */}
          {hotel.roomTypes?.length > 0 && (
            <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', borderTop: 'none', padding: '2rem', marginBottom: '1px' }}>
              <div className="vg-overline" style={{ marginBottom: '1.2rem' }}>Select Room Type</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--vg-border)' }}>
                {hotel.roomTypes.map((room: any) => (
                  <div key={room.type} onClick={() => setSelectedRoom(room)}
                    style={{
                      background: selectedRoom?.type === room.type ? 'var(--vg-gold-dim)' : 'var(--vg-bg-card)',
                      border: selectedRoom?.type === room.type ? '1px solid var(--vg-gold-border)' : '0px',
                      padding: '1.2rem 1.4rem', cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'background 0.2s',
                    }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.15rem', fontWeight: 300, color: selectedRoom?.type === room.type ? 'var(--vg-gold)' : 'var(--vg-text)', marginBottom: '0.3rem' }}>
                        {room.type}
                      </div>
                      <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.76rem', color: 'var(--vg-text-3)' }}>{room.description}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="vg-stat-num" style={{ fontSize: '1.3rem' }}>{formatCurrency(room.price, hotel.currency)}</div>
                      <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.42rem', letterSpacing: '0.15em', color: 'var(--vg-text-3)' }}>PER NIGHT</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {hotel.reviews?.length > 0 && (
            <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', borderTop: 'none', padding: '2rem' }}>
              <div className="vg-overline" style={{ marginBottom: '1.5rem' }}>Guest Reviews</div>
              {hotel.reviews.slice(0, 5).map((review: any) => (
                <div key={review.id} style={{ paddingBottom: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--vg-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.88rem', color: 'var(--vg-text)', marginBottom: '0.25rem' }}>{review.user?.name}</div>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {Array.from({ length: review.rating }).map((_: any, s: number) => (
                          <span key={s} style={{ color: 'var(--vg-star)', fontSize: '0.65rem' }}>★</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.44rem', letterSpacing: '0.15em', color: 'var(--vg-text-3)' }}>
                      {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  {review.title && <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1rem', color: 'var(--vg-text)', marginBottom: '0.4rem' }}>{review.title}</div>}
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'var(--vg-text-2)', lineHeight: 1.7, margin: 0 }}>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky booking card */}
        <div>
          <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-gold-border)', position: 'sticky', top: '80px' }}>
            {/* Top gold bar */}
            <div style={{ height: '2px', background: 'linear-gradient(to right, var(--vg-gold), var(--vg-gold-2))' }} />

            <div style={{ padding: '1.8rem' }}>
              <div className="vg-overline" style={{ marginBottom: '1.2rem' }}>Book Your Stay</div>

              {/* Price display */}
              <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--vg-border)' }}>
                <span className="vg-stat-num" style={{ fontSize: '2rem' }}>{formatCurrency(pricePerNight, hotel.currency)}</span>
                <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.44rem', letterSpacing: '0.15em', color: 'var(--vg-text-3)', marginLeft: '0.5rem' }}>/ NIGHT</span>
              </div>

              {/* Dates */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.44rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--vg-text-3)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <Calendar size={11} /> Check-in
                </label>
                <input type="date" min={today} value={bookingData.checkIn}
                  onChange={e => setBookingData({ ...bookingData, checkIn: e.target.value })}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--vg-gold-border)'}
                  onBlur={e => e.target.style.borderColor = 'var(--vg-border)'} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.44rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--vg-text-3)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <Calendar size={11} /> Check-out
                </label>
                <input type="date" min={bookingData.checkIn || today} value={bookingData.checkOut}
                  onChange={e => setBookingData({ ...bookingData, checkOut: e.target.value })}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--vg-gold-border)'}
                  onBlur={e => e.target.style.borderColor = 'var(--vg-border)'} />
              </div>

              {/* Guests + rooms */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.44rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--vg-text-3)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <Users size={11} /> Guests
                  </label>
                  <input type="number" min={1} max={20} value={bookingData.guests}
                    onChange={e => setBookingData({ ...bookingData, guests: parseInt(e.target.value) || 1 })}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--vg-gold-border)'}
                    onBlur={e => e.target.style.borderColor = 'var(--vg-border)'} />
                </div>
                <div>
                  <label style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.44rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--vg-text-3)', marginBottom: '0.5rem', display: 'block' }}>Rooms</label>
                  <input type="number" min={1} max={10} value={bookingData.rooms}
                    onChange={e => setBookingData({ ...bookingData, rooms: parseInt(e.target.value) || 1 })}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--vg-gold-border)'}
                    onBlur={e => e.target.style.borderColor = 'var(--vg-border)'} />
                </div>
              </div>

              {/* Price breakdown */}
              {nights > 0 && (
                <div style={{ background: 'var(--vg-bg-surface)', padding: '1rem', marginBottom: '1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--vg-text-3)' }}>
                      {formatCurrency(pricePerNight, hotel.currency)} × {nights}n × {bookingData.rooms}rm
                    </span>
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--vg-text-2)' }}>{formatCurrency(subtotal, hotel.currency)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--vg-text-3)' }}>Service fee (10%)</span>
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--vg-text-2)' }}>{formatCurrency(subtotal * 0.1, hotel.currency)}</span>
                  </div>
                  <div style={{ height: '1px', background: 'var(--vg-border)', margin: '0.5rem 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.48rem', letterSpacing: '0.15em', color: 'var(--vg-text-2)' }}>TOTAL</span>
                    <span className="vg-stat-num" style={{ fontSize: '1.1rem' }}>{formatCurrency(total, hotel.currency)}</span>
                  </div>
                </div>
              )}

              <button onClick={handleBooking} className="vg-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1.1rem', fontSize: '0.54rem' }}>
                Book Now — π {pricePerNight > 0 ? pricePerNight.toFixed(2) : '—'}/night
              </button>

              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.7rem', color: 'var(--vg-text-3)', textAlign: 'center', marginTop: '0.75rem' }}>
                Free cancellation up to 24 hours before check-in
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
