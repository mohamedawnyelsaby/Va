'use client';
// PATH: src/app/[locale]/bookings/page.tsx
import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, Clock, AlertCircle, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { VG, monoLabel } from '@/lib/tokens';

function SkeletonRow() {
  return (
    <div style={{ background: 'var(--vg-bg-card)', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', overflow: 'hidden' }}>
      <div style={{ width: '42px', height: '42px', background: 'var(--vg-bg-surface)', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(201,162,39,0.06),transparent)', animation: 'shimmer 1.8s infinite' }} />
      </div>
      <div style={{ flex: 1 }}>
        {[55, 35].map((w, i) => (
          <div key={i} style={{ height: '9px', background: 'var(--vg-bg-surface)', marginBottom: '0.5rem', width: `${w}%`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(201,162,39,0.06),transparent)', animation: `shimmer 1.8s infinite ${i * 0.2}s` }} />
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
    // FIX: was 0.5rem — now VG.font.tiny
    fontSize: VG.font.tiny,
    cursor: active ? 'default' : 'pointer',
    transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
      <button
        onClick={() => onPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        style={{ ...btnStyle(false), width: 'auto', padding: '0 0.9rem', opacity: currentPage === 1 ? 0.4 : 1 }}
      >
        <ChevronLeft size={14} />
      </button>

      {pages.map((p, i) =>
        p === 'ellipsis'
          ? <span key={`e${i}`} style={{ fontFamily: 'var(--font-space-mono)', fontSize: VG.font.tiny, color: 'var(--vg-text-3)', padding: '0 0.25rem', display: 'flex', alignItems: 'center' }}>…</span>
          : <button key={p} onClick={() => onPage(p)} style={btnStyle(p === currentPage)}>{p}</button>
      )}

      <button
        onClick={() => onPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        style={{ ...btnStyle(false), width: 'auto', padding: '0 0.9rem', opacity: currentPage === totalPages ? 0.4 : 1 }}
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; Icon: any; label: string }> = {
  confirmed: { color: '#10b981', bg: 'rgba(16,185,129,0.08)',  Icon: CheckCircle, label: 'Confirmed' },
  pending:   { color: '#C9A227', bg: 'rgba(201,162,39,0.08)', Icon: Clock,        label: 'Pending' },
  cancelled: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  Icon: AlertCircle,  label: 'Cancelled' },
};

export default function BookingsPage() {
  const params  = useParams();
  const locale  = (params?.locale as string) || 'en';
  const [bookings,    setBookings]    = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/bookings?page=${page}&limit=10`)
      .then(r => r.json())
      .then(d => { setBookings(d.bookings || []); setTotalPages(d.pagination?.totalPages || 1); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>

      {/* Header */}
      <div style={{
        background: 'var(--vg-bg-surface)', borderBottom: '1px solid var(--vg-border)',
        padding: `clamp(2.5rem,5vw,4rem) ${VG.section.x}`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '30%', height: '100%', background: 'radial-gradient(ellipse at right, rgba(201,162,39,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="vg-overline" style={{ marginBottom: '1rem' }}>Account</div>
        <h1 className="vg-display" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
          My <em className="vg-italic">Bookings</em>
        </h1>
      </div>

      <div style={{ padding: `clamp(2rem,5vw,4rem) ${VG.section.x}`, maxWidth: '900px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--vg-border)' }}>
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
            <div style={{ width: '60px', height: '60px', border: '1px solid var(--vg-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--vg-text-3)' }}>
              <Calendar size={24} />
            </div>
            <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2.5rem', fontWeight: 300, color: 'var(--vg-text-3)', marginBottom: '0.8rem' }}>No Bookings Yet</div>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'var(--vg-text-3)', marginBottom: '1rem', lineHeight: 1.7 }}>
              Your upcoming trips will appear here.
            </p>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'var(--vg-text-3)', marginBottom: '2rem' }}>
              Start exploring destinations and make your first booking.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href={`/${locale}/hotels`} className="vg-btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                Explore Hotels <ArrowRight size={13} />
              </Link>
              <Link href={`/${locale}/attractions`} className="vg-btn-outline" style={{ textDecoration: 'none' }}>
                Attractions
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--vg-border)', marginBottom: '2rem' }}>
              {bookings.map(b => {
                const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                const { Icon } = cfg;
                return (
                  <div key={b.id} style={{
                    background: 'var(--vg-bg-card)',
                    padding: '1.5rem clamp(1rem,3vw,1.8rem)',
                    display: 'grid', gridTemplateColumns: 'auto 1fr auto',
                    gap: '1.2rem', alignItems: 'center',
                    transition: VG.transition.color,
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--vg-gold-dim2)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--vg-bg-card)'}
                  >
                    <div style={{ width: '42px', height: '42px', background: cfg.bg, border: `1px solid ${cfg.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={17} style={{ color: cfg.color }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.2rem', fontWeight: 300, color: 'var(--vg-text)', marginBottom: '0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {b.itemName}
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {/* FIX: was 0.44rem — now VG.font.micro */}
                        <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro, letterSpacing: VG.tracking.tight, textTransform: 'uppercase', color: 'var(--vg-text-3)' }}>
                          {new Date(b.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro, letterSpacing: VG.tracking.tight, textTransform: 'uppercase', color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div className="vg-stat-num" style={{ fontSize: '1.1rem' }}>{formatCurrency(b.totalPrice, b.currency)}</div>
                      {b.itemType && (
                        // FIX: was 0.42rem — now VG.font.micro
                        <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro, letterSpacing: VG.tracking.tight, textTransform: 'uppercase', color: 'var(--vg-text-3)', marginTop: '0.2rem' }}>
                          {b.itemType}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* FIX: Full smart pagination instead of max-5-pages */}
            <PaginationBar
              currentPage={page}
              totalPages={totalPages}
              onPage={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />
          </>
        )}
      </div>
    </div>
  );
}
