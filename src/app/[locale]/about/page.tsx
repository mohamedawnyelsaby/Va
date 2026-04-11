// src/app/[locale]/about/page.tsx
export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>
      <div style={{ background: 'var(--vg-bg-surface)', borderBottom: '1px solid var(--vg-border)', padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,7vw,5rem)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,162,39,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="vg-overline" style={{ justifyContent: 'center', marginBottom: '1.2rem' }}>Our Story</div>
        <h1 className="vg-display" style={{ fontSize: 'clamp(2.5rem,6vw,5rem)', marginBottom: '1.5rem' }}>
          About <em className="vg-italic">Va Travel</em>
        </h1>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '1rem', color: 'var(--vg-text-2)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.8 }}>
          Va Travel is an AI-powered global travel platform built on Pi Network. Our mission is to make luxury travel accessible, seamless, and rewarding for everyone worldwide.
        </p>
      </div>

      <div style={{ padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,7vw,5rem)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1px', background: 'var(--vg-border)', maxWidth: '1000px', margin: '3rem auto 0' }}>
        {[
          { num: '47M+', label: 'Pi Network Users', desc: 'Connected global community of travelers and pioneers.' },
          { num: '180+', label: 'Countries', desc: 'Every corner of the world, accessible with Pi.' },
          { num: '50K+', label: 'Properties', desc: 'Curated hotels, resorts, and unique stays worldwide.' },
          { num: '2%',   label: 'Pi Cashback', desc: 'Earn Pi on every booking you make on our platform.' },
        ].map(item => (
          <div key={item.label} style={{ background: 'var(--vg-bg-card)', padding: '2rem', textAlign: 'center' }}>
            <div className="vg-stat-num" style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>{item.num}</div>
            <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.48rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--vg-text-3)', marginBottom: '0.7rem' }}>{item.label}</div>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', color: 'var(--vg-text-2)', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
