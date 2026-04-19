'use client';
// PATH: src/app/[locale]/restaurants/page.tsx
// FIX: Skeleton shimmer uses CSS variable — visible in light mode
// FIX: Image filter via vg-hotel-thumb CSS class (handled in globals.css)
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Search, MapPin, Star, Heart, SlidersHorizontal, Utensils, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { VG } from '@/lib/tokens';

// FIX: skeleton shimmer now uses CSS variable defined in globals.css
function SkeletonCard() {
  return (
    <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', overflow: 'hidden' }}>
      <div style={{ height: '200px', background: 'var(--vg-skel-bg, var(--vg-bg-surface))', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, var(--vg-skel-shine, rgba(201,162,39,0.08)) 50%, transparent 100%)',
          animation: 'shimmer 1.8s infinite',
        }} />
      </div>
      <div style={{ padding: '1.2rem' }}>
        {[75, 55, 40].map((w, i) => (
          <div key={i} style={{
            height: '9px',
            background: 'var(--vg-skel-bg, var(--vg-bg-surface))',
            marginBottom: '0.6rem', width: `${w}%`,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, var(--vg-skel-shine, rgba(201,162,39,0.08)) 50%, transparent 100%)',
              animation: `shimmer 1.8s infinite ${i * 0.2}s`,
            }} />
          </div>
        ))}
      </div>
      <style>{`@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}`}</style>
    </div>
  );
}

function PaginationBar({
  currentPage,
  totalPages,
  onPage,
}: {
  currentPage: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | 'ellipsis')[] = [];
  const delta = 2;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis');
    }
  }

  const btnStyle = (active: boolean): React.CSSProperties => ({
    width: '38px', height: '38px',
    background: active ? 'var(--vg-gold)' : 'none',
    border: `1px solid ${active ? 'var(--vg-gold)' : 'var(--vg-border)'}`,
    color: active ? 'var(--vg-bg)' : 'var(--vg-text-2)',
    fontFamily: 'var(--font-space-mono)',
    fontSize: VG.font.tiny,
    cursor: active ? 'default' : 'pointer',
    transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', marginTop: '3rem', flexWrap: 'wrap' }}>
      <button onClick={() => onPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
        style={{ ...btnStyle(false), width: 'auto', padding: '0 0.9rem', opacity: currentPage === 1 ? 0.4 : 1 }}>
        <ChevronLeft size={14} />
      </button>
      {pages.map((p, i) =>
        p === 'ellipsis'
          ? <span key={`e${i}`} style={{ fontFamily: 'var(--font-space-mono)', fontSize: VG.font.tiny, color: 'var(--vg-text-3)', padding: '0 0.25rem' }}>…</span>
          : <button key={p} onClick={() => onPage(p)} style={btnStyle(p === currentPage)}>{p}</button>
      )}
      <button onClick={() => onPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
        style={{ ...btnStyle(false), width: 'auto', padding: '0 0.9rem', opacity: currentPage === totalPages ? 0.4 : 1 }}>
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

const PRICE_COLORS: Record<string, string> = {
  '$': '#10b981', '$$': 'var(--vg-gold)', '$$$': '#f59e0b', '$$$$': '#ef4444',
};
const PRICE_LABELS: Record<string, string> = {
  '$': 'Budget', '$$': 'Moderate', '$$$': 'Upscale', '$$$$': 'Fine Dining',
};

export default function RestaurantsPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ cuisine: '', priceRange: '', sortBy: 'rating', order: 'desc' });

  const CUISINES = ['Italian','Chinese','Japanese','Mexican','French','Indian','Thai','Mediterranean','American','Arabic','Korean','Vietnamese','Greek','Spanish'];
  const PRICE_RANGES = [
    { value: '$', label: '$ — Budget' },
    { value: '$$', label: '$$ — Moderate' },
    { value: '$$$', label: '$$$ — Upscale' },
    { value: '$$$$', label: '$$$$ — Fine Dining' },
  ];

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const q = new URLSearchParams({
        page: currentPage.toString(), limit: '12',
        ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
      });
      if (searchTerm) q.append('search', searchTerm);
      const res = await fetch(`/api/restaurants?${q}`);
      const data = await res.json();
      setRestaurants(data.restaurants || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.total || 0);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchRestaurants(); }, [currentPage, filters]);

  const toggleFav = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    setFavorites(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: 'var(--vg-bg-surface)', border: '1px solid var(--vg-border)',
    padding: '0.65rem 0.8rem', fontFamily: 'var(--font-dm-sans)',
    fontSize: VG.font.body, color: 'var(--vg-text)', outline: 'none',
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro,
    letterSpacing: '0.2em', textTransform: 'uppercase',
    color: 'var(--vg-text-3)', display: 'block', marginBottom: '0.5rem',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>

      {/* Header */}
      <div style={{
        background: 'var(--vg-bg-surface)', borderBottom: '1px solid var(--vg-border)',
        padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,7vw,5rem) 0',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', background: 'radial-gradient(ellipse at right top, rgba(201,162,39,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="vg-overline" style={{ marginBottom: '1rem' }}>Dining</div>
        <h1 className="vg-display" style={{ fontSize: 'clamp(2rem,5vw,3.8rem)', marginBottom: '0.5rem' }}>
          Discover Great <em className="vg-italic">Restaurants</em>
        </h1>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.body, color: 'var(--vg-text-2)', marginBottom: '2rem' }}>
          {totalCount > 0 ? `${totalCount.toLocaleString()} dining experiences worldwide` : 'Find the perfect dining experience around the world'}
        </p>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'stretch', maxWidth: '680px', marginBottom: '-1px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', borderRight: 'none', padding: '0.9rem 1rem' }}>
            <Search size={14} color="var(--vg-text-3)" style={{ flexShrink: 0 }} />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setCurrentPage(1); fetchRestaurants(); } }}
              placeholder="Search restaurants, cuisines..."
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.body, color: 'var(--vg-text)' }} />
            {searchTerm && (
              <button onClick={() => { setSearchTerm(''); setCurrentPage(1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--vg-text-3)', padding: 0 }}>
                <X size={13} />
              </button>
            )}
          </div>
          <button onClick={() => { setCurrentPage(1); fetchRestaurants(); }} className="vg-btn-primary" style={{ padding: '0.9rem 1.5rem' }}>Search</button>
          <button onClick={() => setShowFilters(!showFilters)} style={{
            background: showFilters ? 'var(--vg-gold-dim)' : 'var(--vg-bg-card)',
            border: '1px solid var(--vg-border)', borderLeft: 'none',
            cursor: 'pointer', padding: '0.9rem 1.1rem',
            color: showFilters ? 'var(--vg-gold)' : 'var(--vg-text-3)',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro,
            letterSpacing: '0.15em', textTransform: 'uppercase', transition: 'all 0.2s',
          }}>
            <SlidersHorizontal size={13} /> Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div style={{ background: 'var(--vg-bg-card)', borderBottom: '1px solid var(--vg-gold-border)', padding: '1.5rem clamp(1.5rem,7vw,5rem)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.2rem', maxWidth: '680px' }}>
            <div>
              <label style={labelStyle}>Cuisine</label>
              <select value={filters.cuisine} onChange={e => setFilters({ ...filters, cuisine: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">All Cuisines</option>
                {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Price Range</label>
              <select value={filters.priceRange} onChange={e => setFilters({ ...filters, priceRange: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Any Price</option>
                {PRICE_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Sort By</label>
              <select value={`${filters.sortBy}-${filters.order}`} onChange={e => { const [s, o] = e.target.value.split('-'); setFilters({ ...filters, sortBy: s, order: o }); }} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="rating-desc">Top Rated</option>
                <option value="reviewCount-desc">Most Reviews</option>
                <option value="name-asc">Name A–Z</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => { setCurrentPage(1); fetchRestaurants(); setShowFilters(false); }} className="vg-btn-primary" style={{ padding: '0.65rem 1.5rem' }}>Apply</button>
            <button onClick={() => { setFilters({ cuisine: '', priceRange: '', sortBy: 'rating', order: 'desc' }); setCurrentPage(1); }} className="vg-btn-outline" style={{ padding: '0.65rem 1.2rem' }}>Reset</button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div style={{ padding: 'clamp(2rem,5vw,4rem) clamp(1.5rem,7vw,5rem)' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1px', background: 'var(--vg-border)' }}>
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : restaurants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
            <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '3rem', color: 'var(--vg-text-3)', marginBottom: '1rem' }}>No Restaurants Found</div>
            <button onClick={() => { setFilters({ cuisine: '', priceRange: '', sortBy: 'rating', order: 'desc' }); setSearchTerm(''); }} className="vg-btn-outline">Clear Filters</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1px', background: 'var(--vg-border)' }}>
            {restaurants.map(restaurant => {
              const cuisineLabel = Array.isArray(restaurant.cuisine) ? restaurant.cuisine[0] : restaurant.cuisine;
              const priceColor = PRICE_COLORS[restaurant.priceRange] || 'var(--vg-gold)';
              return (
                <Link key={restaurant.id} href={`/${locale}/restaurants/${restaurant.id}`}
                  style={{ textDecoration: 'none', display: 'block', background: 'var(--vg-bg-card)' }}
                  className="vg-hotel-card">
                  <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                    <Image src={restaurant.thumbnail || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600'}
                      alt={restaurant.name} fill sizes="(max-width:768px)100vw,33vw"
                      className="vg-hotel-thumb" style={{ position: 'absolute' }} />
                    <button onClick={e => toggleFav(e, restaurant.id)}
                      style={{ position: 'absolute', bottom: '0.8rem', right: '0.8rem', zIndex: 3, background: 'rgba(3,2,10,0.7)', border: '1px solid var(--vg-gold-border)', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Heart size={12} style={{ color: favorites.has(restaurant.id) ? 'var(--vg-gold)' : 'var(--vg-text-3)', fill: favorites.has(restaurant.id) ? 'var(--vg-gold)' : 'none' }} />
                    </button>
                    {restaurant.isFeatured && (
                      <div className="vg-badge-outline" style={{ position: 'absolute', top: '0.8rem', left: '0.8rem', zIndex: 3 }}><span className="dot" />Featured</div>
                    )}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem 0.8rem 0.6rem', background: 'linear-gradient(to top,rgba(3,2,10,0.85) 0%,transparent 100%)', zIndex: 2 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Utensils size={10} color="var(--vg-gold)" />
                        <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--vg-gold)' }}>
                          {cuisineLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '1.1rem' }}>
                    <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.2rem', fontWeight: 300, color: 'var(--vg-text)', marginBottom: '0.4rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {restaurant.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                      <MapPin size={11} color="var(--vg-text-3)" />
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'var(--vg-text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {restaurant.cityRelation?.name || restaurant.city}, {restaurant.cityRelation?.country || restaurant.country}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Star size={11} style={{ color: 'var(--vg-star)', fill: 'var(--vg-star)' }} />
                        <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: VG.font.small, color: 'var(--vg-gold)' }}>
                          {restaurant.rating?.toFixed(1) || '—'}
                        </span>
                        <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'var(--vg-text-3)' }}>
                          ({restaurant.reviewCount || 0})
                        </span>
                      </div>
                      {Array.isArray(restaurant.cuisine) && restaurant.cuisine.slice(0, 2).map((c: string) => (
                        <span key={c} style={{ fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--vg-bg-surface)', border: '1px solid var(--vg-border)', color: 'var(--vg-text-3)', padding: '0.2rem 0.4rem' }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--vg-border)', padding: '0.75rem 1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.9rem', color: priceColor, letterSpacing: '0.05em' }}>
                        {restaurant.priceRange || '$$'}
                      </span>
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'var(--vg-text-3)' }}>
                        {PRICE_LABELS[restaurant.priceRange] || 'Moderate'}
                      </span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro, letterSpacing: '0.15em', color: 'var(--vg-gold)' }}>
                      View →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          onPage={p => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        />
      </div>
    </div>
  );
}
