// ═══════════════════════════════════════════════════════════════
// FIXED STATIC PAGES — All converted to VG Design System
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
// src/app/[locale]/careers/page.tsx
// ─────────────────────────────────────────────────────────────
export function CareersPage() {
  const roles = [
    { title: 'Senior Full-Stack Engineer', dept: 'Engineering', loc: 'Remote', type: 'Full-time' },
    { title: 'AI/ML Product Designer', dept: 'Design', loc: 'Remote', type: 'Full-time' },
    { title: 'Pi Network Integration Specialist', dept: 'Engineering', loc: 'Remote', type: 'Contract' },
    { title: 'Travel Content Curator', dept: 'Content', loc: 'Hybrid', type: 'Full-time' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>
      {/* Header */}
      <div style={{
        background: 'var(--vg-bg-surface)', borderBottom: '1px solid var(--vg-border)',
        padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,7vw,5rem)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,162,39,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="vg-overline" style={{ justifyContent: 'center', marginBottom: '1.2rem' }}>Join Us</div>
        <h1 className="vg-display" style={{ fontSize: 'clamp(2.5rem,6vw,5rem)', marginBottom: '1.5rem', textAlign: 'center' }}>
          Careers at <em className="vg-italic">Va Travel</em>
        </h1>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem', color: 'var(--vg-text-2)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.8, textAlign: 'center' }}>
          We are building the future of travel. Join our team and help shape the world's first AI-powered travel platform on Pi Network.
        </p>
      </div>

      {/* Open Roles */}
      <div style={{ padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,7vw,5rem)', maxWidth: '900px', margin: '0 auto' }}>
        <div className="vg-overline" style={{ marginBottom: '2rem' }}>Open Positions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--vg-border)' }}>
          {roles.map(role => (
            <div key={role.title} style={{
              background: 'var(--vg-bg-card)', padding: '1.5rem 2rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexWrap: 'wrap', gap: '1rem', transition: 'background .2s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--vg-gold-dim2)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--vg-bg-card)'}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.2rem', fontWeight: 300, color: 'var(--vg-text)', marginBottom: '0.4rem' }}>{role.title}</div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {[role.dept, role.loc, role.type].map(tag => (
                    <span key={tag} style={{
                      fontFamily: 'var(--font-space-mono)', fontSize: '0.46rem',
                      letterSpacing: '0.15em', textTransform: 'uppercase',
                      color: 'var(--vg-text-3)',
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
              <button className="vg-btn-outline" style={{ padding: '0.55rem 1.2rem', fontSize: '0.48rem' }}>
                Apply →
              </button>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem', background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)' }}>
          <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.86rem', color: 'var(--vg-text-2)', marginBottom: '1rem' }}>
            Don't see your role? Send us your CV anyway.
          </div>
          <a href="mailto:careers@vatravel.com" className="vg-btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            careers@vatravel.com
          </a>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// src/app/[locale]/help/page.tsx
// ─────────────────────────────────────────────────────────────
export function HelpPage() {
  const faqs = [
    { q: 'How do I pay with Pi?', a: 'Open the app in Pi Browser, sign in with your Pi account, then select "Pay with Pi" at checkout. Your Pi wallet connects automatically.' },
    { q: 'Is my booking confirmed immediately?', a: 'Yes — all bookings on Va Travel are confirmed instantly. You will receive a confirmation email with your booking details.' },
    { q: 'What is the 2% Pi cashback?', a: 'On every completed booking, Va Travel credits 2% of the booking value in Pi to your wallet as a loyalty reward.' },
    { q: 'Can I cancel my booking?', a: 'Pending bookings can be cancelled from your dashboard. Cancellation policies vary by property — check the listing details.' },
    { q: 'Which languages does the AI support?', a: 'Logy AI supports all major world languages including Arabic, English, French, Spanish, Chinese, Japanese, and more.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>
      <div style={{ background: 'var(--vg-bg-surface)', borderBottom: '1px solid var(--vg-border)', padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,7vw,5rem)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,162,39,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="vg-overline" style={{ justifyContent: 'center', marginBottom: '1.2rem' }}>Help Center</div>
        <h1 className="vg-display" style={{ fontSize: 'clamp(2.5rem,6vw,5rem)', marginBottom: '1.2rem' }}>
          How Can We <em className="vg-italic">Help?</em>
        </h1>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem', color: 'var(--vg-text-2)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.8 }}>
          Browse our FAQs or contact our 24/7 support team.
        </p>
      </div>

      <div style={{ padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,7vw,5rem)', maxWidth: '800px', margin: '0 auto' }}>
        <div className="vg-overline" style={{ marginBottom: '2rem' }}>Frequently Asked</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--vg-border)' }}>
          {faqs.map((faq, i) => (
            <details key={i} style={{ background: 'var(--vg-bg-card)' }}>
              <summary style={{
                padding: '1.2rem 1.5rem', cursor: 'pointer', listStyle: 'none',
                fontFamily: 'var(--font-cormorant)', fontSize: '1.15rem', fontWeight: 300,
                color: 'var(--vg-text)', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                {faq.q}
                <span style={{ color: 'var(--vg-gold)', fontSize: '1.2rem', flexShrink: 0, marginLeft: '1rem' }}>+</span>
              </summary>
              <div style={{
                padding: '0 1.5rem 1.2rem',
                fontFamily: 'var(--font-dm-sans)', fontSize: '0.86rem',
                color: 'var(--vg-text-2)', lineHeight: 1.75,
                borderTop: '1px solid var(--vg-border)',
                paddingTop: '1rem',
              }}>
                {faq.a}
              </div>
            </details>
          ))}
        </div>

        <div style={{ marginTop: '3rem', background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', padding: '2rem', textAlign: 'center' }}>
          <div className="vg-overline" style={{ justifyContent: 'center', marginBottom: '1rem' }}>Still Need Help?</div>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.86rem', color: 'var(--vg-text-2)', marginBottom: '1.5rem' }}>
            Our support team is available 24/7.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:support@vatravel.com" className="vg-btn-primary" style={{ textDecoration: 'none' }}>Email Support</a>
            <div className="vg-badge-outline" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span className="dot" />24/7 Online
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// src/app/[locale]/terms/page.tsx
// ─────────────────────────────────────────────────────────────
export function TermsPage() {
  const sections = [
    { title: 'Acceptance of Terms', content: 'By using Va Travel, you agree to these terms. Va Travel provides a travel booking platform powered by AI and Pi Network payments. These terms govern your use of our services.' },
    { title: 'Booking & Payments', content: 'All bookings are subject to availability and provider terms. Payments via Pi Network are final once confirmed on the blockchain. Va Travel acts as an intermediary between users and accommodation providers.' },
    { title: 'Cancellation Policy', content: 'Cancellation terms vary by property. Please review each listing\'s cancellation policy before booking. Refunds for Pi payments will be processed within 24–72 hours.' },
    { title: 'User Responsibilities', content: 'You are responsible for maintaining the security of your account credentials and Pi wallet. Any activity under your account is your responsibility.' },
    { title: 'Changes to Terms', content: 'Va Travel reserves the right to update these terms at any time. Continued use of the platform constitutes acceptance of any changes. We will notify users of material changes via email.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>
      <div style={{ background: 'var(--vg-bg-surface)', borderBottom: '1px solid var(--vg-border)', padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,7vw,5rem)', textAlign: 'center' }}>
        <div className="vg-overline" style={{ justifyContent: 'center', marginBottom: '1.2rem' }}>Legal</div>
        <h1 className="vg-display" style={{ fontSize: 'clamp(2.5rem,6vw,5rem)', marginBottom: '1rem' }}>
          Terms of <em className="vg-italic">Service</em>
        </h1>
        <p style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.5rem', letterSpacing: '0.2em', color: 'var(--vg-text-3)' }}>
          Last updated: January 2026
        </p>
      </div>
      <div style={{ padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,7vw,5rem)', maxWidth: '800px', margin: '0 auto' }}>
        {sections.map((section, i) => (
          <div key={i} style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.5rem', letterSpacing: '0.2em', color: 'var(--vg-gold)' }}>0{i + 1}</span>
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 300, color: 'var(--vg-text)' }}>{section.title}</h2>
            </div>
            <div style={{ height: '1px', background: 'var(--vg-border)', marginBottom: '1rem' }} />
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.88rem', color: 'var(--vg-text-2)', lineHeight: 1.8 }}>{section.content}</p>
          </div>
        ))}
        <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', padding: '1.5rem', marginTop: '1rem' }}>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'var(--vg-text-2)', lineHeight: 1.7, margin: 0 }}>
            Questions about our terms? Contact us at <span style={{ color: 'var(--vg-gold)' }}>legal@vatravel.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// src/app/[locale]/privacy/page.tsx
// ─────────────────────────────────────────────────────────────
export function PrivacyPage() {
  const sections = [
    { title: 'Data We Collect', content: 'Va Travel collects only the data necessary to provide our services, including name, email, and booking history. We do not sell your personal data to third parties.' },
    { title: 'Pi Network Data', content: 'Pi Network user data (UID, username) is stored securely and never shared with third parties without consent. Access tokens are encrypted and stored with industry-standard security.' },
    { title: 'Data Security', content: 'We use industry-standard AES-256 encryption to protect all personal data. Our systems are regularly audited for security vulnerabilities.' },
    { title: 'Your Rights', content: 'You may request deletion of your data at any time from your account settings. You can also request a copy of all data we hold about you by contacting privacy@vatravel.com.' },
    { title: 'Cookies', content: 'We use essential cookies for authentication and preferences. We do not use advertising cookies. See our Cookie Policy for full details.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>
      <div style={{ background: 'var(--vg-bg-surface)', borderBottom: '1px solid var(--vg-border)', padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,7vw,5rem)', textAlign: 'center' }}>
        <div className="vg-overline" style={{ justifyContent: 'center', marginBottom: '1.2rem' }}>Legal</div>
        <h1 className="vg-display" style={{ fontSize: 'clamp(2.5rem,6vw,5rem)', marginBottom: '1rem' }}>
          Privacy <em className="vg-italic">Policy</em>
        </h1>
        <p style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.5rem', letterSpacing: '0.2em', color: 'var(--vg-text-3)' }}>
          Last updated: January 2026
        </p>
      </div>
      <div style={{ padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,7vw,5rem)', maxWidth: '800px', margin: '0 auto' }}>
        {sections.map((section, i) => (
          <div key={i} style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.5rem', letterSpacing: '0.2em', color: 'var(--vg-gold)' }}>0{i + 1}</span>
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 300, color: 'var(--vg-text)' }}>{section.title}</h2>
            </div>
            <div style={{ height: '1px', background: 'var(--vg-border)', marginBottom: '1rem' }} />
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.88rem', color: 'var(--vg-text-2)', lineHeight: 1.8 }}>{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// src/app/[locale]/cookies/page.tsx
// ─────────────────────────────────────────────────────────────
export function CookiesPage() {
  const cookieTypes = [
    { name: 'Essential Cookies', desc: 'Required for authentication, session management, and core platform functionality. Cannot be disabled.', required: true },
    { name: 'Preference Cookies', desc: 'Remember your language, theme (light/dark), and display preferences across sessions.', required: false },
    { name: 'Analytics Cookies', desc: 'Help us understand how users interact with the platform so we can improve it. All data is anonymised.', required: false },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>
      <div style={{ background: 'var(--vg-bg-surface)', borderBottom: '1px solid var(--vg-border)', padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,7vw,5rem)', textAlign: 'center' }}>
        <div className="vg-overline" style={{ justifyContent: 'center', marginBottom: '1.2rem' }}>Legal</div>
        <h1 className="vg-display" style={{ fontSize: 'clamp(2.5rem,6vw,5rem)', marginBottom: '1rem' }}>
          Cookie <em className="vg-italic">Policy</em>
        </h1>
      </div>
      <div style={{ padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,7vw,5rem)', maxWidth: '800px', margin: '0 auto' }}>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.88rem', color: 'var(--vg-text-2)', lineHeight: 1.8, marginBottom: '3rem' }}>
          Va Travel uses cookies to improve your experience, remember your preferences, and keep you signed in. Below is a full breakdown of the cookies we use.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--vg-border)' }}>
          {cookieTypes.map(ct => (
            <div key={ct.name} style={{ background: 'var(--vg-bg-card)', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', gap: '2rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.2rem', fontWeight: 300, color: 'var(--vg-text)', marginBottom: '0.5rem' }}>{ct.name}</div>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'var(--vg-text-2)', lineHeight: 1.7, margin: 0 }}>{ct.desc}</p>
              </div>
              <div className={ct.required ? 'vg-badge-outline' : ''} style={{
                flexShrink: 0, padding: '0.25rem 0.7rem',
                background: ct.required ? 'var(--vg-gold-dim)' : 'var(--vg-bg-surface)',
                border: `1px solid ${ct.required ? 'var(--vg-gold-border)' : 'var(--vg-border)'}`,
                fontFamily: 'var(--font-space-mono)', fontSize: '0.44rem',
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: ct.required ? 'var(--vg-gold)' : 'var(--vg-text-3)',
              }}>
                {ct.required ? 'Required' : 'Optional'}
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'var(--vg-text-3)', lineHeight: 1.7, marginTop: '2rem' }}>
          You can disable optional cookies in your browser settings, but some features may not work correctly. Session cookies are automatically deleted when you close your browser.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// src/app/[locale]/press/page.tsx
// ─────────────────────────────────────────────────────────────
export function PressPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '560px' }}>
        <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, var(--vg-gold), transparent)', marginBottom: '2rem', opacity: 0.6 }} />
        <div className="vg-overline" style={{ justifyContent: 'center', marginBottom: '1.2rem' }}>Press & Media</div>
        <h1 className="vg-display" style={{ fontSize: 'clamp(2rem,5vw,4rem)', marginBottom: '1.2rem' }}>
          Media <em className="vg-italic">Kit</em>
        </h1>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem', color: 'var(--vg-text-2)', lineHeight: 1.8, marginBottom: '2rem' }}>
          For press inquiries, interviews, and media requests, please reach out to our communications team.
        </p>
        <a href="mailto:press@vatravel.com" className="vg-btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', marginBottom: '1.5rem' }}>
          press@vatravel.com
        </a>
        <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, var(--vg-gold), transparent)', marginTop: '2rem', opacity: 0.6 }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// src/app/[locale]/safety/page.tsx
// ─────────────────────────────────────────────────────────────
export function SafetyPage() {
  const pillars = [
    { icon: '🔒', title: 'Verified Bookings', desc: 'Every booking is confirmed on-chain via Pi Network. Immutable and tamper-proof.' },
    { icon: '🛡', title: 'Secure Payments', desc: 'Pi Network blockchain ensures all transactions are transparent and irreversible only with your consent.' },
    { icon: '✅', title: 'Vetted Properties', desc: 'Our team manually reviews every hotel, restaurant, and attraction listed on Va Travel.' },
    { icon: '🔐', title: 'Data Protection', desc: 'AES-256 encryption, zero data selling, and full GDPR compliance for all user data.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>
      <div style={{ background: 'var(--vg-bg-surface)', borderBottom: '1px solid var(--vg-border)', padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,7vw,5rem)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,162,39,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="vg-overline" style={{ justifyContent: 'center', marginBottom: '1.2rem' }}>Trust & Safety</div>
        <h1 className="vg-display" style={{ fontSize: 'clamp(2.5rem,6vw,5rem)', marginBottom: '1.5rem' }}>
          Your Safety is Our <em className="vg-italic">Priority</em>
        </h1>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem', color: 'var(--vg-text-2)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.8 }}>
          All bookings are protected and verified. We partner with trusted providers worldwide to ensure safe travel experiences.
        </p>
      </div>
      <div style={{ padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,7vw,5rem)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1px', background: 'var(--vg-border)', maxWidth: '1000px', margin: '3rem auto 0' }}>
        {pillars.map(p => (
          <div key={p.title} style={{ background: 'var(--vg-bg-card)', padding: '2rem 1.5rem' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>{p.icon}</div>
            <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.2rem', fontWeight: 300, color: 'var(--vg-text)', marginBottom: '0.6rem' }}>{p.title}</div>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'var(--vg-text-2)', lineHeight: 1.75, margin: 0 }}>{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
