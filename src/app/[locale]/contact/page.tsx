export default function ContactPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '560px' }}>
        <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, var(--vg-gold), transparent)', marginBottom: '2rem', opacity: 0.6 }} />
        <div className="vg-overline" style={{ justifyContent: 'center', marginBottom: '1.2rem' }}>Get in Touch</div>
        <h1 className="vg-display" style={{ fontSize: 'clamp(2rem,5vw,4rem)', marginBottom: '1.2rem' }}>
          Contact <em className="vg-italic">Us</em>
        </h1>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem', color: 'var(--vg-text-2)', lineHeight: 1.8, marginBottom: '2rem' }}>
          We would love to hear from you. Reach us at <span style={{ color: 'var(--vg-gold)' }}>support@vatravel.com</span>
        </p>
        <div className="vg-badge-outline" style={{ display: 'inline-flex' }}><span className="dot" />24/7 Support</div>
      </div>
    </div>
  );
}
