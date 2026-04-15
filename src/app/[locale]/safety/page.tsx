// PATH: src/app/[locale]/safety/page.tsx
export default function SafetyPage() {
  const PILLARS = [
    { title: 'Verified Properties', desc: 'Every hotel, restaurant, and attraction is manually reviewed before listing on our platform.' },
    { title: 'Blockchain Payments', desc: 'All Pi Network transactions are immutably recorded on the blockchain — fully transparent and tamper-proof.' },
    { title: 'Data Encryption', desc: 'Personal data is encrypted at rest and in transit using AES-256 and TLS 1.3 standards.' },
    { title: 'Fraud Detection', desc: 'Real-time monitoring detects and blocks suspicious activities to protect your account and bookings.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>
      <div style={{ background: 'var(--vg-bg-surface)', borderBottom: '1px solid var(--vg-border)', padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,7vw,5rem)', textAlign: 'center' }}>
        <div className="vg-overline" style={{ justifyContent: 'center', marginBottom: '1.2rem' }}>Peace of Mind</div>
        <h1 className="vg-display" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', marginBottom: '1rem' }}>
          Safety at <em className="vg-italic">Va Travel</em>
        </h1>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.88rem', color: 'var(--vg-text-2)', maxWidth: '520px', margin: '0 auto' }}>
          Your safety is our top priority. All bookings are protected and verified. We partner with trusted providers worldwide to ensure safe travel experiences.
        </p>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(2rem,5vw,4rem) clamp(1.5rem,7vw,5rem)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1px', background: 'var(--vg-border)' }}>
          {PILLARS.map(p => (
            <div key={p.title} className="vg-feat" style={{ flexDirection: 'column', gap: '0.6rem', padding: '2rem' }}>
              <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.3rem', fontWeight: 300, color: 'var(--vg-text)' }}>{p.title}</div>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.84rem', color: 'var(--vg-text-2)', lineHeight: 1.7, margin: 0 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
