// PATH: src/app/[locale]/privacy/page.tsx
const CONTACT_EMAIL = 'mohamed.awny.00000@gmail.com';

export default function PrivacyPage() {
  const sections = [
    {
      title: 'About This Policy',
      body: 'Va Travel is a travel booking platform with an AI assistant and payments through Pi Network. This policy explains what data we collect and how we use it.',
    },
    {
      title: 'Data We Collect',
      body: 'We collect your name, your Pi Network username and Pi user ID, your email address if you provide one, your wallet address if you approve that permission when signing in with Pi, your booking details, and the payment records linked to your bookings.',
    },
    {
      title: 'Pi Network Data',
      body: 'When you sign in with Pi, we receive your Pi username and user ID, plus your wallet address if you approve it. We use this data to identify your account and process Pi payments. We never ask for or receive your Pi password, passphrase, or private keys. We do not sell Pi Network user data.',
    },
    {
      title: 'How We Use Your Data',
      body: 'We use your data to sign you in, create and manage your bookings, process Pi payments and refunds, show your booking history, and keep the service secure and working.',
    },
    {
      title: 'AI Assistant',
      body: 'Text you type into the AI assistant is sent to our AI service providers to produce a reply. Please do not enter sensitive personal information into the assistant.',
    },
    {
      title: 'Service Providers',
      body: 'We use third-party services to run Va Travel, such as hosting, database, AI, hotel data, image, email, and error-monitoring providers. They receive only the data needed for their function. Pi payments are processed by Pi Network under its own terms and privacy policy. Payments recorded on the Pi blockchain are public and cannot be deleted by us.',
    },
    {
      title: 'Cookies and Local Storage',
      body: 'We use a session cookie to keep you signed in and your browser local storage to remember your sign-in and preferences. You can clear them in your browser settings, but you may need to sign in again.',
    },
    {
      title: 'Security',
      body: 'We use encrypted connections (HTTPS) and verify every Pi sign-in and payment on our server with the Pi Network API. No system is completely secure.',
    },
    {
      title: 'Access and Deletion Requests',
      body: `To access, correct, or delete your personal data, email ${CONTACT_EMAIL}. We may keep records that we are required to keep, and we cannot remove payments recorded on the Pi blockchain.`,
    },
    {
      title: 'Changes to This Policy',
      body: 'We may update this policy. The latest version is always on this page, with the date it was last updated.',
    },
    {
      title: 'Contact',
      body: `Questions about this policy: ${CONTACT_EMAIL}`,
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>
      <div style={{ background: 'var(--vg-bg-surface)', borderBottom: '1px solid var(--vg-border)', padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,7vw,5rem)', textAlign: 'center' }}>
        <div className="vg-overline" style={{ justifyContent: 'center', marginBottom: '1.2rem' }}>Legal</div>
        <h1 className="vg-display" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', marginBottom: '1rem' }}>
          Privacy <em className="vg-italic">Policy</em>
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
