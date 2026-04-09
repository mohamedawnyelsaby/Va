'use client';

/* ── VG Skeleton — Void Gold shimmer loading states ── */

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = '1rem', style }: SkeletonProps) {
  return (
    <>
      <div style={{
        width,
        height,
        background: 'var(--vg-bg-deep)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(201,162,39,0.06) 50%, transparent 100%)',
          animation: 'vg-shimmer 1.8s ease-in-out infinite',
        }} />
      </div>
      <style>{`
        @keyframes vg-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </>
  );
}

export function HotelCardSkeleton() {
  return (
    <div style={{
      background: 'var(--vg-bg-card)',
      height: '100%',
    }}>
      <Skeleton height="220px" />
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Skeleton height="1.4rem" width="75%" />
        <Skeleton height="0.9rem" width="55%" />
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--vg-border)' }}>
          <Skeleton height="1rem" width="80px" />
          <Skeleton height="0.8rem" width="90px" />
        </div>
      </div>
    </div>
  );
}

export function HotelsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1px',
      background: 'var(--vg-border)',
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <HotelCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '1px',
      background: 'var(--vg-border)',
    }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{ background: 'var(--vg-bg-card)', padding: '1.75rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton height="0.6rem" width="100px" />
            <Skeleton height="14px" width="14px" />
          </div>
          <Skeleton height="2.4rem" width="80px" />
        </div>
      ))}
    </div>
  );
}

export function BookingRowSkeleton() {
  return (
    <div style={{
      padding: '1rem 1.5rem',
      borderBottom: '1px solid var(--vg-border)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    }}>
      <Skeleton width="32px" height="32px" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <Skeleton height="0.88rem" width="65%" style={{ marginBottom: '0.3rem' }} />
        <Skeleton height="0.6rem" width="45%" />
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <Skeleton height="1.1rem" width="70px" style={{ marginBottom: '0.2rem' }} />
        <Skeleton height="0.6rem" width="50px" />
      </div>
    </div>
  );
}
