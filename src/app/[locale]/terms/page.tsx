// PATH: src/app/[locale]/terms/page.tsx
export default function TermsPage() {
  const sections = [
    { title: 'Acceptance of Terms', body: 'By using Va Travel, you agree to these terms. Va Travel provides a travel booking platform powered by AI and Pi Network payments.' },
    { title: 'Bookings', body: 'All bookings are subject to availability and provider terms. Payments via Pi Network are final once confirmed on the blockchain.' },
    { title: 'Changes to Terms', body: 'Va Travel reserves the right to update these terms at any time. Continued use of the platform constitutes acceptance of any changes.' },
    { title: 'Liability', body: 'Va Travel acts as an intermediary between travelers and service providers. We are not liable for actions or omissions of third-party providers.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>
      <div style={{ background: 'var(--vg-bg-surface)', borderBottom: '1px solid var(--vg-border)', padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,7vw,5rem)', textAlign: 'center' }}>
        <div className="vg-overline" style={{ justifyContent: 'center', marginBottom: '1.2rem' }}>Legal</div>
        <h1 className="vg-display" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', marginBottom: '1rem' }}>
          Terms of <em className="vg-italic">Service</em>
        </h1>
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: 'clamp(2rem,5vw,4rem) clamp(1.5rem,7vw,5rem)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--vg-border)' }}>
          {sections.map(s => (
            <div key={s.title} style={{ background: 'var(--vg-bg-card)', padding: '1.8rem 2rem' }}>
              <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.3rem', fontWeight: 300, color: 'var(--vg-text)', marginBottom: '0.6rem' }}>{s.title}</div>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.84rem', color: 'var(--vg-text-2)', lineHeight: 1.8, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
