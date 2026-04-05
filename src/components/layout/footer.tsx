'use client';
// PATH: src/components/layout/footer.tsx
import Link from 'next/link';

const LINKS = {
  Explore:  [['Hotels','hotels'],['Attractions','attractions'],['Restaurants','restaurants'],['AI Assistant','ai-assistant']],
  Company:  [['About','about'],['Blog','blog'],['Careers','careers'],['Press','press']],
  Legal:    [['Privacy','privacy'],['Terms','terms'],['Cookies','cookies']],
};

export function Footer({ locale }: { locale: string }) {
  return (
    <footer style={{ background: 'var(--vg-bg-surface)', borderTop: '1px solid var(--vg-border)', padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,7vw,5rem) 2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
        {/* Brand */}
        <div>
          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.6rem', fontWeight: 300, color: 'var(--vg-text)', marginBottom: '1rem' }}>
            Va<span style={{ color: 'var(--vg-gold)', fontStyle: 'italic' }}> Travel</span>
          </div>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', color: 'var(--vg-text-2)', lineHeight: 1.7, maxWidth: '200px' }}>
            AI-powered global travel platform built on the Pi Network.
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.8rem' }}>
            {['𝕏', 'in', 'π'].map((icon) => (
              <a key={icon} href="#" style={{ width: '32px', height: '32px', border: '1px solid var(--vg-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--vg-text-2)', textDecoration: 'none', fontSize: '0.7rem', transition: 'color 0.2s, border-color 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--vg-gold)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--vg-gold-border)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--vg-text-2)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--vg-border)'; }}>
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(LINKS).map(([col, items]) => (
          <div key={col}>
            <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.5rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--vg-gold)', marginBottom: '1.2rem' }}>
              {col}
            </div>
            {items.map(([label, slug]) => (
              <Link key={slug} href={`/${locale}/${slug}`} style={{ display: 'block', marginBottom: '0.65rem', fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--vg-text-2)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--vg-gold)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--vg-text-2)')}>
                {label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid var(--vg-border)', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.48rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--vg-text-3)' }}>
          © {new Date().getFullYear()} Va Travel. All rights reserved.
        </span>
        <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.48rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--vg-text-3)' }}>
          Powered by <span style={{ color: 'var(--vg-gold)' }}>Pi Network</span>
        </span>
      </div>
    </footer>
  );
}
