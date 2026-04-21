// PATH: src/app/[locale]/trust/page.tsx
export default function TrustPage() {
  const PILLARS = [
    {
      icon: '🔐',
      title: 'Bank-Level Encryption',
      desc: 'All personal data is encrypted at rest using AES-256 and in transit via TLS 1.3. Your information is never sold or shared.',
    },
    {
      icon: '⛓️',
      title: 'Blockchain Payments',
      desc: 'Pi Network payments are recorded immutably on the Pi blockchain — fully transparent, tamper-proof, and verifiable.',
    },
    {
      icon: '✅',
      title: 'Verified Properties',
      desc: 'Every hotel, restaurant, and attraction is manually reviewed by our team before appearing on the platform.',
    },
    {
      icon: '🛡️',
      title: 'Fraud Detection',
      desc: 'Real-time monitoring detects and blocks suspicious activities, protecting your account and every booking you make.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>

      {/* Header */}
      <div style={{
        background: 'var(--vg-bg-surface)',
        borderBottom: '1px solid var(--vg-border)',
        padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,7vw,5rem)',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,168,83,0.05) 0%, transparent 70%)',
        }} />
        <div className="vg-overline" style={{ justifyContent: 'center', marginBottom: '1.2rem' }}>Peace of Mind</div>
        <h1 className="vg-display" style={{ fontSize: 'clamp(2.5rem,6vw,5rem)', marginBottom: '1.5rem' }}>
          Trust &amp; <em className="vg-italic">Safety</em>
        </h1>
        <p style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem',
          color: 'var(--vg-text-2)', maxWidth: '540px',
          margin: '0 auto', lineHeight: 1.8,
        }}>
          Va Travel uses bank-level encryption and blockchain-powered Pi Network payments
          to keep your data and transactions completely secure.
        </p>
      </div>

      {/* Pillars */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,7vw,5rem)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1px',
          background: 'var(--vg-border)',
          marginBottom: '3rem',
        }}>
          {PILLARS.map(p => (
            <div
              key={p.title}
              className="vg-feat"
              style={{ flexDirection: 'column', gap: '1rem', padding: '2rem' }}
            >
              <div style={{ fontSize: '1.8rem', lineHeight: 1 }}>{p.icon}</div>
              <div style={{
                fontFamily: 'var(--font-cormorant)', fontSize: '1.3rem',
                fontWeight: 300, color: 'var(--vg-text)',
              }}>{p.title}</div>
              <p style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '0.84rem',
                color: 'var(--vg-text-2)', lineHeight: 1.75, margin: 0,
              }}>{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Trust badge row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1px', background: 'var(--vg-border)',
        }}>
          {[
            { num: '100%', label: 'Blockchain Secured' },
            { num: 'AES-256', label: 'Data Encryption' },
            { num: 'TLS 1.3', label: 'Transport Security' },
            { num: '24/7', label: 'Fraud Monitoring' },
          ].map(item => (
            <div key={item.label} style={{
              background: 'var(--vg-bg-card)', padding: '1.8rem',
              textAlign: 'center',
            }}>
              <div className="vg-stat-num" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{item.num}</div>
              <div style={{
                fontFamily: 'var(--font-space-mono)', fontSize: '0.54rem',
                letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--vg-text-3)',
              }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
