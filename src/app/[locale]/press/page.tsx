// PATH: src/app/[locale]/press/page.tsx
"use client";

export default function PressPage() {
  const PRESS_ITEMS = [
    { outlet: 'TechCrunch', headline: 'Va Travel brings Pi Network payments to luxury hospitality', date: '2025' },
    { outlet: 'Forbes',     headline: 'The AI travel platform redefining how 47 million Pi users book trips', date: '2025' },
    { outlet: 'Wired',      headline: 'Pi Network finds its killer app in global travel booking', date: '2025' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>

      {/* Header */}
      <div style={{
        background: 'var(--vg-bg-surface)',
        borderBottom: '1px solid var(--vg-border)',
        padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,7vw,5rem)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,168,83,0.05) 0%, transparent 70%)',
        }} />
        <div className="vg-overline" style={{ justifyContent: 'center', marginBottom: '1.2rem' }}>Media</div>
        <h1 className="vg-display" style={{ fontSize: 'clamp(2.5rem,6vw,5rem)', marginBottom: '1.5rem' }}>
          Press &amp; <em className="vg-italic">Media</em>
        </h1>
        <p style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem',
          color: 'var(--vg-text-2)', maxWidth: '540px', margin: '0 auto', lineHeight: 1.8,
        }}>
          For press inquiries, interview requests, and media kits, contact our communications team.
        </p>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,7vw,5rem)' }}>

        {/* Press coverage */}
        <div className="vg-overline" style={{ marginBottom: '1.5rem' }}>In the News</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--vg-border)', marginBottom: '3rem' }}>
          {PRESS_ITEMS.map(item => (
            <div
              key={item.outlet}
              style={{
                background: 'var(--vg-bg-card)', padding: '1.8rem 2rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                gap: '1.5rem', flexWrap: 'wrap',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--vg-gold-dim2)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--vg-bg-card)'}
            >
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{
                  fontFamily: 'var(--font-space-mono)', fontSize: '0.58rem',
                  letterSpacing: '0.20em', textTransform: 'uppercase',
                  color: 'var(--vg-gold)', marginBottom: '0.6rem',
                }}>{item.outlet}</div>
                <div style={{
                  fontFamily: 'var(--font-cormorant)', fontSize: '1.2rem',
                  fontWeight: 300, color: 'var(--vg-text)', lineHeight: 1.3,
                }}>{item.headline}</div>
              </div>
              <div style={{
                fontFamily: 'var(--font-space-mono)', fontSize: '0.58rem',
                letterSpacing: '0.15em', color: 'var(--vg-text-3)', flexShrink: 0,
              }}>{item.date}</div>
            </div>
          ))}
        </div>

        {/* Media Contact */}
        <div style={{
          background: 'var(--vg-bg-card)', border: '1px solid var(--vg-gold-border)',
          padding: '2.5rem', textAlign: 'center',
        }}>
          <div style={{ height: '2px', background: 'linear-gradient(to right, var(--vg-gold), var(--vg-gold-2))', marginBottom: '2rem' }} />
          <div style={{
            fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem',
            fontWeight: 300, color: 'var(--vg-text)', marginBottom: '0.8rem',
          }}>
            Media Enquiries
          </div>
          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '0.86rem',
            color: 'var(--vg-text-2)', marginBottom: '1.5rem', lineHeight: 1.7,
          }}>
            Our communications team responds within 24 hours to all media requests.
          </p>
          <a href="mailto:press@vatravel.com" className="vg-btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            press@vatravel.com
          </a>
        </div>
      </div>
    </div>
  );
}
