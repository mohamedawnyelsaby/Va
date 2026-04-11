export default function BlogPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, var(--vg-gold), transparent)', marginBottom: '2rem', opacity: 0.6 }} />
        </div>
        <div className="vg-overline" style={{ justifyContent: 'center', marginBottom: '1.2rem' }}>Blog</div>
        <h1 className="vg-display" style={{ fontSize: 'clamp(2.5rem,6vw,5rem)', marginBottom: '1.2rem' }}>
          Va Travel <em className="vg-italic">Blog</em>
        </h1>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem', color: 'var(--vg-text-2)', maxWidth: '480px', margin: '0 auto 2.5rem', lineHeight: 1.8 }}>
          Travel tips, destination guides, and Pi Network updates. Coming soon.
        </p>
        <div className="vg-badge-outline" style={{ display: 'inline-flex' }}>
          <span className="dot" />Coming Soon
        </div>
      </div>
    </div>
  );
}
