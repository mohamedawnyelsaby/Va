'use client';
// PATH: src/components/ui/vg-skeleton.tsx
// UPDATED: وضع نهاري مكتمل مع shimmer واضح

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
        background: 'var(--vg-skel-bg)',
        position:   'relative',
        overflow:   'hidden',
        ...style,
      }}>
        <div style={{
          position:   'absolute',
          inset:      0,
          background: 'linear-gradient(90deg, transparent 0%, var(--vg-skel-shine) 50%, transparent 100%)',
          animation:  'vg-shimmer 1.8s ease-in-out infinite',
        }} />
      </div>
      <style>{`
        @keyframes vg-shimmer {
          0%   { transform: translateX(-100%); }
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
      border:     '1px solid var(--vg-border)',
      height:     '100%',
    }}>
      <Skeleton height="220px" />
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Skeleton height="1.4rem" width="75%" />
        <Skeleton height="0.9rem" width="55%" />
        <div style={{
          display:       'flex',
          justifyContent:'space-between',
          paddingTop:    '0.75rem',
          borderTop:     '1px solid var(--vg-border)',
        }}>
          <Skeleton height="1rem"  width="80px" />
          <Skeleton height="0.8rem" width="90px" />
        </div>
      </div>
    </div>
  );
}

export function HotelsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div style={{
      display:             'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap:                 '1px',
      background:          'var(--vg-border)',
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
      display:             'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap:                 '1px',
      background:          'var(--vg-border)',
    }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{
          background:    'var(--vg-bg-card)',
          padding:       '1.75rem 1.5rem',
          display:       'flex',
          flexDirection: 'column',
          gap:           '0.75rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton height="0.6rem" width="100px" />
            <Skeleton height="14px"  width="14px" />
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
      padding:     '1rem 1.5rem',
      borderBottom:'1px solid var(--vg-border)',
      display:     'flex',
      alignItems:  'center',
      gap:         '1rem',
    }}>
      <Skeleton width="32px" height="32px" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <Skeleton height="0.88rem" width="65%" style={{ marginBottom: '0.3rem' }} />
        <Skeleton height="0.6rem"  width="45%" />
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <Skeleton height="1.1rem" width="70px" style={{ marginBottom: '0.2rem' }} />
        <Skeleton height="0.6rem" width="50px" />
      </div>
    </div>
  );
}

export function AttractionsGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div style={{
      display:             'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap:                 '1px',
      background:          'var(--vg-border)',
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', overflow: 'hidden' }}>
          <Skeleton height="200px" />
          <div style={{ padding: '1.2rem' }}>
            {[75, 55, 40].map((w, j) => (
              <Skeleton key={j} height="9px" width={`${w}%`} style={{ marginBottom: '0.6rem' }} />
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--vg-border)', padding: '0.75rem 1.1rem', display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton height="1rem" width="60px" />
            <Skeleton height="0.7rem" width="40px" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MessageSkeletonRow({ isUser = false }: { isUser?: boolean }) {
  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      alignItems:    isUser ? 'flex-end' : 'flex-start',
      gap:           '0.4rem',
      padding:       '0 clamp(1rem,4vw,2rem)',
    }}>
      {!isUser && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Skeleton width="24px" height="24px" />
          <Skeleton width="60px" height="0.6rem" />
        </div>
      )}
      <Skeleton
        width={isUser ? '40%' : '60%'}
        height="3rem"
        style={{ borderRadius: '0' }}
      />
    </div>
  );
}
