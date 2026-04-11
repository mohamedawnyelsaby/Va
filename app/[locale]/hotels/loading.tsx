export default function LocaleLoading() {
  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)',
      background: 'var(--vg-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1.2rem',
      paddingTop: '60px',
    }}>
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
      <style>{`@keyframes vg-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
