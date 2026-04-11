'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { Search, Hotel, MapPin, Star, Ticket, Utensils, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

function SkeletonRow() {
  return (
    <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', display: 'flex', gap: '1rem', padding: '1rem', overflow: 'hidden' }}>
      <div style={{ width: '80px', height: '80px', background: 'var(--vg-bg-surface)', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent 0%,rgba(201,162,39,0.06) 50%,transparent 100%)', animation: 'shimmer 1.8s infinite' }} />
      </div>
      <div style={{ flex: 1 }}>
        {[60, 40, 30].map((w, i) => (
          <div key={i} style={{ height: '9px', background: 'var(--vg-bg-surface)', marginBottom: '0.5rem', width: `${w}%`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent 0%,rgba(201,162,39,0.06) 50%,transparent 100%)', animation: `shimmer 1.8s infinite ${i * 0.15}s` }} />
          </div>
        ))}
      </div>
      <style>{`@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}`}</style>
    </div>
  );
}

function ResultCard({ item, type, locale }: { item: any; type: string; locale: string }) {
  const href = `/${locale}/${type}/${item.id}`;
  const img = item.thumbnail || (type === 'hotels' ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200' :
    type === 'restaurants' ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200' :
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=200');

  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'flex', gap: '1.1rem', background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', padding: '1.1rem', transition: 'border-color 0.2s' }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--vg-gold-border)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--vg-border)'}>
      <div style={{ width: '80px', height: '80px', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
        <Image src={img} alt={item.name} fill style={{ objectFit: 'cover', filter: 'brightness(0.75) saturate(0.7)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.15rem', fontWeight: 300, color: 'var(--vg-text)', marginBottom: '0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
          <MapPin size={11} color="var(--vg-text-3)" />
          <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.74rem', color: 'var(--vg-text-3)' }}>
            {item.city}, {item.country}
          </span>
        </div>
        {item.rating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Star size={11} style={{ color: 'var(--vg-star)', fill: 'var(--vg-star)' }} />
            <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.64rem', color: 'var(--vg-gold)' }}>{item.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {item.pricePerNight && (
          <div>
            <div className="vg-stat-num" style={{ fontSize: '0.9rem' }}>{formatCurrency(item.pricePerNight, item.currency)}</div>
            <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.38rem', letterSpacing: '0.12em', color: 'var(--vg-text-3)' }}>/ NIGHT</div>
          </div>
        )}
        {item.ticketPrice && (
          <div>
            <div className="vg-stat-num" style={{ fontSize: '0.9rem' }}>{formatCurrency(item.ticketPrice, item.currency)}</div>
            <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.38rem', letterSpacing: '0.12em', color: 'var(--vg-text-3)' }}>ENTRY</div>
          </div>
        )}
        {item.priceRange && (
          <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.9rem', color: 'var(--vg-gold)' }}>{item.priceRange}</div>
        )}
      </div>
    </Link>
  );
}

function CityCard({ city, locale }: { city: any; locale: string }) {
  return (
    <Link href={`/${locale}/hotels?city=${city.name}`} style={{ textDecoration: 'none', display: 'flex', gap: '1.1rem', background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', padding: '1.1rem', transition: 'border-color 0.2s' }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--vg-gold-border)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--vg-border)'}>
      <div style={{ width: '80px', height: '80px', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
        {city.thumbnail ? (
          <Image src={city.thumbnail} alt={city.name} fill style={{ objectFit: 'cover', filter: 'brightness(0.65) saturate(0.6)' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'var(--vg-bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--vg-gold)', fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem' }}>✦</div>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.15rem', fontWeight: 300, color: 'var(--vg-text)', marginBottom: '0.3rem' }}>{city.name}</div>
        <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.76rem', color: 'var(--vg-text-3)', marginBottom: '0.4rem' }}>{city.country}</div>
        {city.description && (
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.76rem', color: 'var(--vg-text-3)', lineHeight: 1.5, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {city.description}
          </p>
        )}
      </div>
    </Link>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [localQuery, setLocalQuery] = useState(query);
  const [currentQuery, setCurrentQuery] = useState(query);

  useEffect(() => {
    if (query.length >= 2) { setCurrentQuery(query); setLocalQuery(query); doSearch(query); }
  }, [query]);

  const doSearch = async (q: string) => {
    if (q.length < 2) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=all&limit=8`);
      const data = await res.json();
      setResults(data);
    } catch { setResults(null); } finally { setLoading(false); }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const url = new URL(window.location.href);
    url.searchParams.set('q', localQuery);
    window.history.pushState({}, '', url.toString());
    setCurrentQuery(localQuery);
    doSearch(localQuery);
  };

  const total = results ? (results.hotels?.length || 0) + (results.cities?.length || 0) + (results.attractions?.length || 0) + (results.restaurants?.length || 0) : 0;

  const SECTIONS = [
    { key: 'hotels',      label: 'Hotels',      icon: Hotel },
    { key: 'cities',      label: 'Cities',       icon: MapPin },
    { key: 'attractions', label: 'Attractions',  icon: Ticket },
    { key: 'restaurants', label: 'Restaurants',  icon: Utensils },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>

      {/* Search header */}
      <div style={{ background: 'var(--vg-bg-surface)', borderBottom: '1px solid var(--vg-border)', padding: 'clamp(2.5rem,5vw,4rem) clamp(1.5rem,7vw,5rem)' }}>
        <div className="vg-overline" style={{ marginBottom: '1rem' }}>Search</div>
        <h1 className="vg-display" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', marginBottom: '1.5rem' }}>
          Search <em className="vg-italic">Results</em>
        </h1>

        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'stretch', maxWidth: '600px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', borderRight: 'none', padding: '0.9rem 1rem' }}>
            <Search size={14} color="var(--vg-text-3)" style={{ flexShrink: 0 }} />
            <input
              value={localQuery}
              onChange={e => setLocalQuery(e.target.value)}
              placeholder="Search everything..."
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontFamily: 'var(--font-dm-sans)', fontSize: '0.88rem', color: 'var(--vg-text)' }}
            />
            {localQuery && (
              <button type="button" onClick={() => setLocalQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--vg-text-3)', padding: 0 }}><X size={13} /></button>
            )}
          </div>
          <button type="submit" className="vg-btn-primary" style={{ padding: '0.9rem 1.5rem' }}>Search</button>
        </form>
      </div>

      <div style={{ padding: 'clamp(2rem,5vw,4rem) clamp(1.5rem,7vw,5rem)', maxWidth: '800px', margin: '0 auto' }}>

        {/* No query */}
        {!currentQuery && (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2.5rem', color: 'var(--vg-text-3)', marginBottom: '0.8rem' }}>Start Searching</div>
            <p style={{ fontFamily: 'var(--font-dm-sans)', color: 'var(--vg-text-3)' }}>Type a destination, hotel name, or attraction above.</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--vg-border)' }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        )}

        {/* Results */}
        {!loading && results && currentQuery && (
          <>
            <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.84rem', color: 'var(--vg-text-3)', marginBottom: '2rem' }}>
              {total > 0
                ? <><span style={{ color: 'var(--vg-gold)', fontFamily: 'var(--font-space-mono)' }}>{total}</span> results for "<span style={{ color: 'var(--vg-text-2)' }}>{currentQuery}</span>"</>
                : `No results found for "${currentQuery}"`
              }
            </div>

            {total === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2.5rem', color: 'var(--vg-text-3)', marginBottom: '0.8rem' }}>Nothing Found</div>
                <p style={{ fontFamily: 'var(--font-dm-sans)', color: 'var(--vg-text-3)' }}>Try a different search term.</p>
              </div>
            )}

            {SECTIONS.map(({ key, label, icon: Icon }) => {
              const items = results[key];
              if (!items?.length) return null;
              return (
                <div key={key} style={{ marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1rem' }}>
                    <div className="vg-feat-icon" style={{ width: '28px', height: '28px' }}><Icon size={12} /></div>
                    <div className="vg-overline" style={{ margin: 0 }}>{label}</div>
                    <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.44rem', letterSpacing: '0.12em', color: 'var(--vg-text-3)', marginLeft: 'auto' }}>{items.length} found</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--vg-border)' }}>
                    {key === 'cities'
                      ? items.map((item: any) => <CityCard key={item.id} city={item} locale={locale} />)
                      : items.map((item: any) => <ResultCard key={item.id} item={item} type={key} locale={locale} />)
                    }
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '60px' }}>
        <div style={{ width: '36px', height: '36px', border: '1px solid var(--vg-gold-border)', borderTop: '1px solid var(--vg-gold)', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
