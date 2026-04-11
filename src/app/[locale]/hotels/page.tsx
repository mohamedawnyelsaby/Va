'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, Star, Heart, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

function SkeletonCard() {
  return (
    <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', overflow: 'hidden' }}>
      <div style={{ height: '220px', background: 'var(--vg-bg-surface)', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(201,162,39,0.06) 50%, transparent 100%)',
          animation: 'shimmer 1.8s infinite',
        }} />
      </div>
      <div style={{ padding: '1.2rem' }}>
        {[80, 60, 40].map((w, i) => (
          <div key={i} style={{
            height: '10px', background: 'var(--vg-bg-surface)',
            marginBottom: '0.6rem', width: `${w}%`, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(201,162,39,0.06) 50%, transparent 100%)',
              animation: `shimmer 1.8s infinite ${i * 0.2}s`,
            }} />
          </div>
        ))}
      </div>
      <style>{`@keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }`}</style>
    </div>
  );
}

export default function HotelsPage() {
  const { locale } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    minPrice: '', maxPrice: '', starRating: '', sortBy: 'rating', order: 'desc',
  });

  const fetchHotels = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(), limit: '12',
        ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
      });
      if (searchTerm) params.append('search', searchTerm);
      const res = await fetch(`/api/hotels?${params}`);
      const data = await res.json();
      setHotels(data.hotels || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [currentPage, filters, searchTerm]);

  useEffect(() => { fetchHotels(); }, [fetchHotels]);

  const toggleFav = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    setFavorites(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const STARS = [5, 4, 3, 2, 1];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>

      {/* Hero Header */}
      <div style={{
        background: 'var(--vg-bg-surface)',
        borderBottom: '1px solid var(--vg-border)',
        padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,7vw,5rem) 0',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, right: 0, width: '40%', height: '100%',
          background: 'radial-gradient(ellipse at right top, rgba(201,162,39,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="vg-overline" style={{ marginBottom: '1rem' }}>Explore</div>
        <h1 className="vg-display" style={{ fontSize: 'clamp(2rem,5vw,3.8rem)', marginBottom: '0.5rem' }}>
          Find Your Perfect <em className="vg-italic">Hotel</em>
        </h1>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.88rem', color: 'var(--vg-text-2)', marginBottom: '2rem' }}>
          {totalCount > 0 ? `${totalCount.toLocaleString()} properties worldwide` : 'Browse thousands of hotels worldwide'}
        </p>

        {/* Search bar */}
        <div style={{
          display: 'flex', alignItems: 'stretch', gap: 0,
          background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)',
          maxWidth: '680px', marginBottom: '-1px',
        }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.9rem 1rem' }}>
            <Search size={14} color="var(--vg-text-3)" style={{ flexShrink: 0 }} />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setCurrentPage(1); fetchHotels(); } }}
              placeholder="Search hotels, cities..."
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                fontFamily: 'var(--font-dm-sans)', fontSize: '0.88rem', color: 'var(--vg-text)',
              }}
            />
            {searchTerm && (
              <button onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--vg-text-3)', padding: 0 }}>
                <X size={13} />
              </button>
            )}
          </div>
          <button
            onClick={() => { setCurrentPage(1); fetchHotels(); }}
            className="vg-btn-primary"
            style={{ padding: '0.9rem 1.5rem', flexShrink: 0 }}
          >
            Search
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              background: showFilters ? 'var(--vg-gold-dim)' : 'none',
              border: 'none', borderLeft: '1px solid var(--vg-border)',
              cursor: 'pointer', padding: '0.9rem 1.1rem',
              color: showFilters ? 'var(--vg-gold)' : 'var(--vg-text-3)',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              fontFamily: 'var(--font-space-mono)', fontSize: '0.44rem',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            <SlidersHorizontal size={13} />
            Filters
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div style={{
          background: 'var(--vg-bg-card)',
          borderBottom: '1px solid var(--vg-gold-border)',
          padding: '1.5rem clamp(1.5rem,7vw,5rem)',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.2rem', maxWidth: '680px' }}>
            {/* Price Min */}
            <div>
              <label style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.44rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--vg-text-3)', display: 'block', marginBottom: '0.5rem' }}>Min Price</label>
              <input type="number" placeholder="0" value={filters.minPrice}
                onChange={e => setFilters({ ...filters, minPrice: e.target.value })}
                style={{ width: '100%', boxSizing: 'border-box', background: 'var(--vg-bg-surface)', border: '1px solid var(--vg-border)', padding: '0.65rem 0.8rem', fontFamily: 'var(--font-dm-sans)', fontSize: '0.84rem', color: 'var(--vg-text)', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--vg-gold-border)'}
                onBlur={e => e.target.style.borderColor = 'var(--vg-border)'} />
            </div>
            {/* Price Max */}
            <div>
              <label style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.44rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--vg-text-3)', display: 'block', marginBottom: '0.5rem' }}>Max Price</label>
              <input type="number" placeholder="999" value={filters.maxPrice}
                onChange={e => setFilters({ ...filters, maxPrice: e.target.value })}
                style={{ width: '100%', boxSizing: 'border-box', background: 'var(--vg-bg-surface)', border: '1px solid var(--vg-border)', padding: '0.65rem 0.8rem', fontFamily: 'var(--font-dm-sans)', fontSize: '0.84rem', color: 'var(--vg-text)', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--vg-gold-border)'}
                onBlur={e => e.target.style.borderColor = 'var(--vg-border)'} />
            </div>
            {/* Stars */}
            <div>
              <label style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.44rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--vg-text-3)', display: 'block', marginBottom: '0.5rem' }}>Stars</label>
              <select value={filters.starRating} onChange={e => setFilters({ ...filters, starRating: e.target.value })}
                style={{ width: '100%', background: 'var(--vg-bg-surface)', border: '1px solid var(--vg-border)', padding: '0.65rem 0.8rem', fontFamily: 'var(--font-dm-sans)', fontSize: '0.84rem', color: 'var(--vg-text)', outline: 'none', cursor: 'pointer' }}>
                <option value="">All Stars</option>
                {STARS.map(s => <option key={s} value={s}>{'★'.repeat(s)} {s}-Star</option>)}
              </select>
            </div>
            {/* Sort */}
            <div>
              <label style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.44rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--vg-text-3)', display: 'block', marginBottom: '0.5rem' }}>Sort By</label>
              <select value={`${filters.sortBy}-${filters.order}`} onChange={e => {
                const [s, o] = e.target.value.split('-');
                setFilters({ ...filters, sortBy: s, order: o });
              }}
                style={{ width: '100%', background: 'var(--vg-bg-surface)', border: '1px solid var(--vg-border)', padding: '0.65rem 0.8rem', fontFamily: 'var(--font-dm-sans)', fontSize: '0.84rem', color: 'var(--vg-text)', outline: 'none', cursor: 'pointer' }}>
                <option value="rating-desc">Top Rated</option>
                <option value="pricePerNight-asc">Price: Low → High</option>
                <option value="pricePerNight-desc">Price: High → Low</option>
                <option value="reviewCount-desc">Most Reviews</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => { setCurrentPage(1); fetchHotels(); setShowFilters(false); }} className="vg-btn-primary" style={{ padding: '0.65rem 1.5rem' }}>Apply</button>
            <button onClick={() => { setFilters({ minPrice: '', maxPrice: '', starRating: '', sortBy: 'rating', order: 'desc' }); setCurrentPage(1); }} className="vg-btn-outline" style={{ padding: '0.65rem 1.2rem' }}>Reset</button>
          </div>
        </div>
      )}

      {/* Results grid */}
      <div style={{ padding: 'clamp(2rem,5vw,4rem) clamp(1.5rem,7vw,5rem)' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1px', background: 'var(--vg-border)' }}>
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : hotels.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
            <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '3rem', color: 'var(--vg-text-3)', marginBottom: '1rem' }}>No Hotels Found</div>
            <p style={{ fontFamily: 'var(--font-dm-sans)', color: 'var(--vg-text-3)', marginBottom: '2rem' }}>Try adjusting your filters or search term.</p>
            <button onClick={() => { setFilters({ minPrice: '', maxPrice: '', starRating: '', sortBy: 'rating', order: 'desc' }); setSearchTerm(''); }} className="vg-btn-outline">Clear Filters</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1px', background: 'var(--vg-border)' }}>
            {hotels.map((hotel, i) => (
              <Link key={hotel.id} href={`/${locale}/hotels/${hotel.id}`}
                style={{ textDecoration: 'none', display: 'block', background: 'var(--vg-bg-card)' }}
                className="vg-hotel-card">
                {/* Image */}
                <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                  <Image
                    src={hotel.thumbnail || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'}
                    alt={hotel.name} fill sizes="(max-width:768px) 100vw, 33vw"
                    className="vg-hotel-thumb" style={{ position: 'absolute' }}
                  />
                  {/* Price tag */}
                  <div className="vg-price-tag">
                    {formatCurrency(hotel.pricePerNight, hotel.currency)}<span style={{ opacity: 0.6, fontSize: '0.85em' }}>/night</span>
                  </div>
                  {/* Favorite */}
                  <button
                    onClick={e => toggleFav(e, hotel.id)}
                    style={{
                      position: 'absolute', bottom: '1rem', right: '1rem', zIndex: 3,
                      background: 'rgba(3,2,10,0.7)', border: '1px solid var(--vg-gold-border)',
                      width: '32px', height: '32px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.2s',
                    }}
                  >
                    <Heart size={13} style={{ color: favorites.has(hotel.id) ? '#C9A227' : 'var(--vg-text-3)', fill: favorites.has(hotel.id) ? '#C9A227' : 'none' }} />
                  </button>
                  {/* Featured badge */}
                  {hotel.isFeatured && (
                    <div className="vg-badge-outline" style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 3 }}>
                      <span className="dot" />Featured
                    </div>
                  )}
                  {/* Stars overlay */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem 1rem 0.8rem', background: 'linear-gradient(to top, rgba(3,2,10,0.85) 0%, transparent 100%)', zIndex: 2, display: 'flex', gap: '2px' }}>
                    {Array.from({ length: hotel.starRating || 0 }).map((_, s) => (
                      <span key={s} style={{ color: 'var(--vg-star)', fontSize: '0.65rem' }}>★</span>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '1.2rem' }}>
                  <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.25rem', fontWeight: 300, color: 'var(--vg-text)', marginBottom: '0.4rem', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {hotel.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.8rem' }}>
                    <MapPin size={11} color="var(--vg-text-3)" />
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.76rem', color: 'var(--vg-text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {hotel.cityRelation?.name || hotel.city}, {hotel.cityRelation?.country || hotel.country}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Star size={12} style={{ color: 'var(--vg-star)', fill: 'var(--vg-star)' }} />
                      <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.72rem', color: 'var(--vg-gold)' }}>
                        {hotel.rating?.toFixed(1) || '—'}
                      </span>
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', color: 'var(--vg-text-3)' }}>
                        ({hotel.reviewCount || 0})
                      </span>
                    </div>
                    {hotel.amenities?.slice(0, 2).map((a: string) => (
                      <span key={a} style={{
                        fontFamily: 'var(--font-space-mono)', fontSize: '0.42rem',
                        letterSpacing: '0.12em', textTransform: 'uppercase',
                        background: 'var(--vg-gold-dim)', border: '1px solid var(--vg-gold-border)',
                        color: 'var(--vg-gold)', padding: '0.2rem 0.5rem',
                      }}>{a}</span>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA bar */}
                <div style={{
                  borderTop: '1px solid var(--vg-border)',
                  padding: '0.75rem 1.2rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <span className="vg-stat-num" style={{ fontSize: '1.1rem' }}>
                      {formatCurrency(hotel.pricePerNight, hotel.currency)}
                    </span>
                    <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.42rem', letterSpacing: '0.15em', color: 'var(--vg-text-3)', marginLeft: '0.3rem' }}>/NIGHT</span>
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-space-mono)', fontSize: '0.44rem',
                    letterSpacing: '0.18em', textTransform: 'uppercase',
                    color: 'var(--vg-gold)', display: 'flex', alignItems: 'center', gap: '0.3rem',
                  }}>
                    Book Now →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '3rem' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="vg-btn-outline"
              style={{ padding: '0.6rem 1.2rem', opacity: currentPage === 1 ? 0.4 : 1 }}
            >← Prev</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = i + 1;
              return (
                <button key={p} onClick={() => setCurrentPage(p)}
                  style={{
                    width: '38px', height: '38px',
                    background: currentPage === p ? 'var(--vg-gold)' : 'none',
                    border: `1px solid ${currentPage === p ? 'var(--vg-gold)' : 'var(--vg-border)'}`,
                    color: currentPage === p ? 'var(--vg-bg)' : 'var(--vg-text-2)',
                    fontFamily: 'var(--font-space-mono)', fontSize: '0.5rem',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >{p}</button>
              );
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="vg-btn-outline"
              style={{ padding: '0.6rem 1.2rem', opacity: currentPage === totalPages ? 0.4 : 1 }}
            >Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
