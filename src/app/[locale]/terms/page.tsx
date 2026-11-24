// PATH: src/app/[locale]/terms/page.tsx
const CONTACT_EMAIL = 'mohamed.awny.00000@gmail.com';

export default function TermsPage() {
  const sections = [
    {
      title: 'Acceptance of Terms',
      body: 'By using Va Travel, you agree to these terms. Va Travel is a travel booking platform with an AI assistant and payments through Pi Network. If you do not agree, please do not use the service.',
    },
    {
      title: 'Your Account',
      body: 'You sign in with your Pi Network account. You are responsible for activity on your account and for keeping your Pi credentials safe. Never share your Pi password, passphrase, or private keys with anyone. Va Travel will never ask for them.',
    },
    {
      title: 'Bookings',
      body: 'All bookings are subject to availability and the terms of the hotel, restaurant, or other provider. Prices are shown in Pi. Please check the details before you confirm a booking.',
    },
    {
      title: 'Payments',
      body: 'Payments are made in Pi through the Pi Network and are subject to the Pi Network terms. Payments are final once confirmed on the blockchain. Va Travel does not hold your Pi wallet keys and cannot reverse blockchain transactions on its own.',
    },
    {
      title: 'Cancellations and Refunds',
      body: `To request a cancellation or a refund for a paid booking, contact us at ${CONTACT_EMAIL}. Requests are reviewed individually and may depend on the provider's terms.`,
    },
    {
      title: 'AI Assistant',
      body: 'The AI assistant gives suggestions and can make mistakes. Please check prices, availability, and details before you book or travel. It is not professional travel, legal, or financial advice.',
    },
    {
      title: 'Acceptable Use',
      body: 'Do not misuse the service: no fraud, no attempts to break or overload the platform, no unauthorized access, no false bookings, and no use that breaks the law or the Pi Network rules. We may suspend accounts that do.',
    },
    {
      title: 'Third-Party Providers',
      body: 'Va Travel acts as an intermediary between travelers and service providers. We are not responsible for the actions, services, or omissions of third-party providers.',
    },
    {
      title: 'Liability',
      body: 'The service is provided as is. To the extent allowed by law, Va Travel is not liable for indirect or consequential losses, for interruptions of the service, or for issues caused by the Pi Network or other third parties.',
    },
    {
      title: 'Changes to Terms',
      body: 'We may update these terms. The latest version is always on this page, with the date it was last updated. Continued use of the platform means you accept the changes.',
    },
    {
      title: 'Contact',
      body: `Questions about these terms: ${CONTACT_EMAIL}`,
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>
      <div style={{ background: 'var(--vg-bg-surface)', borderBottom: '1px solid var(--vg-border)', padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,7vw,5rem)', textAlign: 'center' }}>
        <div className="vg-overline" style={{ justifyContent: 'center', marginBottom: '1.2rem' }}>Legal</div>
        <h1 className="vg-display" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', marginBottom: '1rem' }}>
          Terms of <em className="vg-italic">Service</em>
        </h1>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--vg-text-2)', margin: 0 }}>
          Last updated: November 24, 2026
        </p>
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
