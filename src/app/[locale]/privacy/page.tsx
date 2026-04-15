// PATH: src/app/[locale]/privacy/page.tsx
export default function PrivacyPage() {
  const sections = [
    { title: 'Data We Collect', body: 'Va Travel collects only the data necessary to provide our services, including name, email, and booking history.' },
    { title: 'Pi Network Data', body: 'Pi Network user data (UID, username) is stored securely and never shared with third parties without consent.' },
    { title: 'Security', body: 'We use industry-standard encryption to protect all personal data. You may request deletion of your data at any time.' },
    { title: 'Cookies', body: 'We use session and persistent cookies to improve your experience. You can manage cookie preferences in your browser settings.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>
      <div style={{ background: 'var(--vg-bg-surface)', borderBottom: '1px solid var(--vg-border)', padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,7vw,5rem)', textAlign: 'center' }}>
        <div className="vg-overline" style={{ justifyContent: 'center', marginBottom: '1.2rem' }}>Legal</div>
        <h1 className="vg-display" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', marginBottom: '1rem' }}>
          Privacy <em className="vg-italic">Policy</em>
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
