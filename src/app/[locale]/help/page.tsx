// PATH: src/app/[locale]/help/page.tsx
export default function HelpPage() {
  const FAQS = [
    { q: 'How do I book a hotel?', a: 'Search for your destination, select dates, choose a room type, and complete payment with Pi Network.' },
    { q: 'How do Pi payments work?', a: 'Open the app in Pi Browser, authenticate with your Pi wallet, and confirm your payment. Funds are settled on the Pi blockchain.' },
    { q: 'Can I cancel my booking?', a: 'Pending bookings can be cancelled from your dashboard. Confirmed bookings follow each property\'s cancellation policy.' },
    { q: 'How do I earn Pi cashback?', a: 'You automatically earn 2% cashback in Pi on every completed booking through Va Travel.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>
      <div style={{ background: 'var(--vg-bg-surface)', borderBottom: '1px solid var(--vg-border)', padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,7vw,5rem)', textAlign: 'center' }}>
        <div className="vg-overline" style={{ justifyContent: 'center', marginBottom: '1.2rem' }}>Support</div>
        <h1 className="vg-display" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', marginBottom: '1rem' }}>
          Help <em className="vg-italic">Center</em>
        </h1>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.88rem', color: 'var(--vg-text-2)', maxWidth: '480px', margin: '0 auto' }}>
          Need help? Browse our FAQs or contact our 24/7 support team.
        </p>
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: 'clamp(2rem,5vw,4rem) clamp(1.5rem,7vw,5rem)' }}>
        <div className="vg-overline" style={{ marginBottom: '1.5rem' }}>Frequently Asked Questions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--vg-border)' }}>
          {FAQS.map(faq => (
            <div key={faq.q} style={{ background: 'var(--vg-bg-card)', padding: '1.5rem 2rem' }}>
              <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.2rem', fontWeight: 300, color: 'var(--vg-text)', marginBottom: '0.6rem' }}>{faq.q}</div>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.84rem', color: 'var(--vg-text-2)', lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem', background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)' }}>
          <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.86rem', color: 'var(--vg-text-2)', marginBottom: '1rem' }}>
            Still need help? Contact our support team.
          </div>
          <a href="mailto:support@vatravel.com" className="vg-btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            support@vatravel.com
          </a>
        </div>
      </div>
    </div>
  );
}
