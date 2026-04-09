'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Search, SlidersHorizontal, Star, MapPin, Heart, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default function HotelsPage() {
  const { locale } = useParams();
  const router = useRouter();

  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    starRating: '',
    sortBy: 'rating',
    order: 'desc',
  });

  const fetchHotels = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
      });
      if (searchTerm) params.append('search', searchTerm);
      const res = await fetch(`/api/hotels?${params}`);
      const data = await res.json();
      setHotels(data.hotels || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, searchTerm]);

  useEffect(() => { fetchHotels(); }, [fetchHotels]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const starOptions = [5, 4, 3, 2, 1];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '64px' }}>

      {/* Hero Header */}
      <div style={{
        padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 7vw, 5rem) 0',
        borderBottom: '1px solid var(--vg-border)',
        background: 'var(--vg-bg-surface)',
      }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.48rem',
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: 'var(--vg-gold)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.75rem',
              }}>
                <span style={{ width: '1.1rem', height: '1px', background: 'var(--vg-gold)', flexShrink: 0 }} />
                Curated Properties
              </div>
              <h1 style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                fontWeight: 300,
                color: 'var(--vg-text)',
                lineHeight: 0.92,
              }}>
                Find Your Perfect <em style={{ color: 'var(--vg-gold)', fontStyle: 'italic' }}>Hotel</em>
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.46rem',
                letterSpacing: '0.15em',
                color: 'var(--vg-text-3)',
              }}>
                {loading ? '—' : `${hotels.length} properties`}
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{
            display: 'flex',
            gap: '0',
            marginBottom: '0',
            border: '1px solid var(--vg-border)',
            background: 'var(--vg-bg-card)',
          }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '0.75rem' }}>
              <Search size={15} color="var(--vg-text-3)" style={{ flexShrink: 0 }} />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchHotels()}
                placeholder="Search by city, hotel name..."
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.9rem',
                  color: 'var(--vg-text)',
                  padding: '0.85rem 0',
                }}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '0 1.25rem',
                background: showFilters ? 'var(--vg-gold-dim)' : 'none',
                border: 'none',
                borderLeft: '1px solid var(--vg-border)',
                cursor: 'pointer',
                color: showFilters ? 'var(--vg-gold)' : 'var(--vg-text-2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.46rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
              }}
            >
              <SlidersHorizontal size={13} />
              Filters
            </button>
            <button
              onClick={fetchHotels}
              className="vg-btn-primary"
              style={{
                borderLeft: '1px solid var(--vg-gold-border)',
                padding: '0 1.5rem',
                fontSize: '0.46rem',
              }}
            >
              Search
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div style={{
              background: 'var(--vg-bg-deep)',
              border: '1px solid var(--vg-border)',
              borderTop: 'none',
              padding: '1.25rem 1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '1.25rem',
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.43rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--vg-text-3)',
                  marginBottom: '0.5rem',
                }}>Min Price / Night</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={e => setFilters({ ...filters, minPrice: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    background: 'var(--vg-bg-surface)',
                    border: '1px solid var(--vg-border)',
                    color: 'var(--vg-text)',
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.43rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--vg-text-3)',
                  marginBottom: '0.5rem',
                }}>Max Price / Night</label>
                <input
                  type="number"
                  placeholder="999"
                  value={filters.maxPrice}
                  onChange={e => setFilters({ ...filters, maxPrice: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    background: 'var(--vg-bg-surface)',
                    border: '1px solid var(--vg-border)',
                    color: 'var(--vg-text)',
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.43rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--vg-text-3)',
                  marginBottom: '0.5rem',
                }}>Star Rating</label>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {starOptions.map(s => (
                    <button
                      key={s}
                      onClick={() => setFilters({ ...filters, starRating: filters.starRating === s.toString() ? '' : s.toString() })}
                      style={{
                        padding: '0.3rem 0.6rem',
                        background: filters.starRating === s.toString() ? 'var(--vg-gold-dim)' : 'none',
                        border: `1px solid ${filters.starRating === s.toString() ? 'var(--vg-gold-border)' : 'var(--vg-border)'}`,
                        color: filters.starRating === s.toString() ? 'var(--vg-gold)' : 'var(--vg-text-2)',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-space-mono)',
                        fontSize: '0.44rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        transition: 'all 0.15s',
                      }}
                    >
                      {s}★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.43rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--vg-text-3)',
                  marginBottom: '0.5rem',
                }}>Sort</label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {[['rating', 'Rating'], ['pricePerNight', 'Price'], ['reviewCount', 'Reviews']].map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setFilters({ ...filters, sortBy: val })}
                      style={{
                        padding: '0.3rem 0.6rem',
                        background: filters.sortBy === val ? 'var(--vg-gold-dim)' : 'none',
                        border: `1px solid ${filters.sortBy === val ? 'var(--vg-gold-border)' : 'var(--vg-border)'}`,
                        color: filters.sortBy === val ? 'var(--vg-gold)' : 'var(--vg-text-2)',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-space-mono)',
                        fontSize: '0.44rem',
                        transition: 'all 0.15s',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  onClick={() => {
                    setFilters({ minPrice: '', maxPrice: '', starRating: '', sortBy: 'rating', order: 'desc' });
                    setSearchTerm('');
                  }}
                  style={{
                    padding: '0.6rem 0.9rem',
                    background: 'none',
                    border: '1px solid var(--vg-border)',
                    color: 'var(--vg-text-3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.43rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  <X size={12} /> Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '1300px',
        margin: '0 auto',
        padding: '2.5rem clamp(1.5rem, 7vw, 5rem)',
      }}>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
            <LoadingSpinner size="lg" />
          </div>
        ) : hotels.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '5rem 2rem',
            border: '1px solid var(--vg-border)',
            background: 'var(--vg-bg-card)',
          }}>
            <p style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.8rem',
              fontWeight: 300,
              color: 'var(--vg-text-2)',
              marginBottom: '0.5rem',
            }}>No properties found</p>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem', color: 'var(--vg-text-3)' }}>
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1px',
              background: 'var(--vg-border)',
              marginBottom: '2.5rem',
            }}>
              {hotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  locale={locale as string}
                  isFavorite={favorites.has(hotel.id)}
                  onFavorite={toggleFavorite}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0', border: '1px solid var(--vg-border)' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '0.65rem 1.25rem',
                    background: 'var(--vg-bg-card)',
                    border: 'none',
                    borderRight: '1px solid var(--vg-border)',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    color: currentPage === 1 ? 'var(--vg-text-3)' : 'var(--vg-text-2)',
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.46rem',
                    letterSpacing: '0.15em',
                  }}
                >← Prev</button>
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    style={{
                      padding: '0.65rem 1rem',
                      background: currentPage === p ? 'var(--vg-gold-dim)' : 'var(--vg-bg-card)',
                      border: 'none',
                      borderRight: '1px solid var(--vg-border)',
                      cursor: 'pointer',
                      color: currentPage === p ? 'var(--vg-gold)' : 'var(--vg-text-2)',
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '0.46rem',
                    }}
                  >{p}</button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '0.65rem 1.25rem',
                    background: 'var(--vg-bg-card)',
                    border: 'none',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    color: currentPage === totalPages ? 'var(--vg-text-3)' : 'var(--vg-text-2)',
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.46rem',
                    letterSpacing: '0.15em',
                  }}
                >Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ── Hotel Card ── */
function HotelCard({ hotel, locale, isFavorite, onFavorite }: {
  hotel: any;
  locale: string;
  isFavorite: boolean;
  onFavorite: (id: string, e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/${locale}/hotels/${hotel.id}`}
      style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: 'var(--vg-bg-card)',
        borderColor: hovered ? 'var(--vg-gold-border)' : 'transparent',
        transition: 'all 0.3s',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Image */}
        <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
          <Image
            src={hotel.thumbnail || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'}
            alt={hotel.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            style={{
              objectFit: 'cover',
              filter: hovered ? 'brightness(0.55) saturate(0.7)' : 'brightness(0.72) saturate(0.75)',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
              transition: 'all 0.7s cubic-bezier(0.25,0.46,0.45,0.94)',
            }}
          />

          {/* Price Tag */}
          <div style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(3,2,10,0.82)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--vg-gold-border)',
            padding: '0.25rem 0.65rem',
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.52rem',
            color: 'var(--vg-gold)',
            letterSpacing: '0.08em',
          }}>
            {formatCurrency(hotel.pricePerNight, hotel.currency)}/night
          </div>

          {/* Favorite */}
          <button
            onClick={(e) => onFavorite(hotel.id, e)}
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              width: '32px',
              height: '32px',
              background: 'rgba(3,2,10,0.6)',
              border: `1px solid ${isFavorite ? 'var(--vg-gold)' : 'rgba(255,255,255,0.15)'}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
              transition: 'all 0.2s',
            }}
          >
            <Heart
              size={13}
              color={isFavorite ? 'var(--vg-gold)' : 'rgba(255,255,255,0.6)'}
              fill={isFavorite ? 'var(--vg-gold)' : 'none'}
            />
          </button>

          {/* Featured Badge */}
          {hotel.isFeatured && (
            <div style={{
              position: 'absolute',
              bottom: '1rem',
              left: '1rem',
              background: 'var(--vg-gold-dim)',
              border: '1px solid var(--vg-gold-border)',
              padding: '0.2rem 0.55rem',
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.42rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--vg-gold)',
            }}>
              Featured
            </div>
          )}

          {/* Stars overlay */}
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            right: '1rem',
            display: 'flex',
            gap: '2px',
          }}>
            {Array.from({ length: hotel.starRating || 0 }).map((_, i) => (
              <span key={i} style={{ color: 'var(--vg-star)', fontSize: '10px' }}>★</span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <h3 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '1.25rem',
            fontWeight: 300,
            color: 'var(--vg-text)',
            lineHeight: 1.2,
            margin: 0,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
          }}>
            {hotel.name}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={11} color="var(--vg-text-3)" style={{ flexShrink: 0 }} />
            <span style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.78rem',
              color: 'var(--vg-text-2)',
            }}>
              {hotel.cityRelation?.name || hotel.city}, {hotel.cityRelation?.country || hotel.country}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--vg-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Star size={12} color="var(--vg-star)" fill="var(--vg-star)" />
              <span style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: '1.1rem',
                fontWeight: 300,
                color: 'var(--vg-text)',
              }}>
                {hotel.rating?.toFixed(1) || '—'}
              </span>
              <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', color: 'var(--vg-text-3)' }}>
                ({hotel.reviewCount || 0})
              </span>
            </div>

            <div style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.44rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: hovered ? 'var(--vg-gold)' : 'var(--vg-text-3)',
              transition: 'color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}>
              View Details →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
