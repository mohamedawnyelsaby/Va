"use client";

export default function CareersPage() {
  const roles = [
    { title: 'Senior Full-Stack Engineer', dept: 'Engineering', loc: 'Remote', type: 'Full-time' },
    { title: 'AI/ML Product Designer', dept: 'Design', loc: 'Remote', type: 'Full-time' },
    { title: 'Pi Network Integration Specialist', dept: 'Engineering', loc: 'Remote', type: 'Contract' },
    { title: 'Travel Content Curator', dept: 'Content', loc: 'Hybrid', type: 'Full-time' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>
      <div style={{ background: 'var(--vg-bg-surface)', borderBottom: '1px solid var(--vg-border)', padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,7vw,5rem)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,162,39,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="vg-overline" style={{ justifyContent: 'center', marginBottom: '1.2rem' }}>Join Us</div>
        <h1 className="vg-display" style={{ fontSize: 'clamp(2.5rem,6vw,5rem)', marginBottom: '1.5rem', textAlign: 'center' }}>
          Careers at <em className="vg-italic">Va Travel</em>
        </h1>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem', color: 'var(--vg-text-2)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.8, textAlign: 'center' }}>
          We are building the future of travel. Join our team and help shape the world's first AI-powered travel platform on Pi Network.
        </p>
      </div>

      <div style={{ padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,7vw,5rem)', maxWidth: '900px', margin: '0 auto' }}>
        <div className="vg-overline" style={{ marginBottom: '2rem' }}>Open Positions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--vg-border)' }}>
          {roles.map(role => (
            <div key={role.title} style={{ background: 'var(--vg-bg-card)', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', transition: 'background .2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--vg-gold-dim2)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--vg-bg-card)'}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.2rem', fontWeight: 300, color: 'var(--vg-text)', marginBottom: '0.4rem' }}>{role.title}</div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {[role.dept, role.loc, role.type].map(tag => (
                    <span key={tag} style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.46rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--vg-text-3)' }}>{tag}</span>
                  ))}
                </div>
              </div>
              <button className="vg-btn-outline" style={{ padding: '0.55rem 1.2rem', fontSize: '0.48rem' }}>Apply →</button>
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
