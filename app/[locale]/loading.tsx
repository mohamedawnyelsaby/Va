export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--vg-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1.5rem',
    }}>
      {/* Animated logo */}
      <div style={{
        fontFamily: 'var(--font-cormorant)',
        fontSize: '2.2rem',
        fontWeight: 300,
        color: 'var(--vg-text)',
        opacity: 0.9,
        animation: 'vg-pulse 2s ease-in-out infinite',
      }}>
        Va<em style={{ color: 'var(--vg-gold)', fontStyle: 'italic' }}> Travel</em>
      </div>

      {/* Gold spinner */}
      <div style={{
        width: '36px',
        height: '36px',
        border: '1px solid var(--vg-gold-border)',
        borderTop: '1px solid var(--vg-gold)',
        borderRadius: '50%',
        animation: 'vg-spin 0.9s linear infinite',
      }} />

      <div style={{
        fontFamily: 'var(--font-space-mono)',
        fontSize: '0.44rem',
        letterSpacing: '0.32em',
        textTransform: 'uppercase',
        color: 'var(--vg-text-3)',
      }}>
        Loading
      </div>

      <style>{`
        @keyframes vg-spin   { to { transform: rotate(360deg); } }
        @keyframes vg-pulse  { 0%,100% { opacity:0.9 } 50% { opacity:0.5 } }
      `}</style>
    </div>
  );
}
