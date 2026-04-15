// PATH: src/app/[locale]/cookies/page.tsx
export default function CookiesPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,7vw,5rem)' }}>
        <div className="vg-overline" style={{ marginBottom: '1.2rem' }}>Legal</div>
        <h1 className="vg-display" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', marginBottom: '2.5rem' }}>
          Cookie <em className="vg-italic">Policy</em>
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {[
            'Va Travel uses cookies to improve your experience, remember your preferences, and keep you signed in.',
            'We use session cookies (deleted when you close the browser) and persistent cookies (stored for up to 30 days).',
            'You can disable cookies in your browser settings, but some features may not work correctly without them.',
          ].map((text, i) => (
            <p key={i} style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.88rem', color: 'var(--vg-text-2)', lineHeight: 1.8, margin: 0, paddingLeft: '1rem', borderLeft: '2px solid var(--vg-gold-border)' }}>
              {text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
