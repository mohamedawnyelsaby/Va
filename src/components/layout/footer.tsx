'use client';
// PATH: src/components/layout/footer.tsx
import Link from 'next/link';

// FIX: Changed 'ai-assistant' → 'ai' to match actual route
const LINKS = {
  Explore:  [['Hotels','hotels'],['Attractions','attractions'],['Restaurants','restaurants'],['AI Assistant','ai']],
  Company:  [['About','about'],['Blog','blog'],['Careers','careers'],['Press','press']],
  Legal:    [['Privacy','privacy'],['Terms','terms'],['Cookies','cookies'],['Safety','safety']],
  Support:  [['Help Center','help'],['Contact','contact'],['Trust','trust']],
};

export function Footer({ locale, isRTL = false }: { locale: string; isRTL?: boolean }) {
  return (
    <footer style={{
      background: 'var(--vg-bg-surface)',
      borderTop: '1px solid var(--vg-border)',
      padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,7vw,5rem) 2rem',
      direction: 'ltr',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '2.5rem',
        marginBottom: '3rem',
      }}>
        {/* Brand */}
        <div style={{ gridColumn: 'span 1' }}>
          <div style={{
            fontFamily: 'var(--font-cormorant)', fontSize: '1.6rem',
            fontWeight: 300, color: 'var(--vg-text)', marginBottom: '1rem',
          }}>
            Va<em style={{ color: 'var(--vg-gold)', fontStyle: 'italic' }}> Travel</em>
          </div>
          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem',
            color: 'var(--vg-text-2)', lineHeight: 1.7,
            maxWidth: '220px', margin: '0 0 1.5rem',
          }}>
            AI-powered global travel platform built on the Pi Network. Book, explore, and earn.
          </p>
          {/* Social */}
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            {[['𝕏','#'],['in','#'],['π','#']].map(([icon, href]) => (
              <a key={icon} href={href}
                aria-label={icon === 'π' ? 'Pi Network' : icon === 'in' ? 'LinkedIn' : 'X (Twitter)'}
                style={{
                  width: '32px', height: '32px',
                  border: '1px solid var(--vg-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--vg-text-2)', textDecoration: 'none',
                  fontSize: '0.75rem', transition: 'color 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--vg-gold)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--vg-gold-border)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--vg-text-2)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--vg-border)';
                }}>
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(LINKS).map(([col, items]) => (
          <div key={col}>
            <div style={{
              fontFamily: 'var(--font-space-mono)', fontSize: '0.52rem',
              letterSpacing: '0.28em', textTransform: 'uppercase',
              color: 'var(--vg-gold)', marginBottom: '1.2rem',
            }}>
              {col}
            </div>
            {(items as string[][]).map(([label, slug]) => (
              <Link key={slug} href={`/${locale}/${slug}`}
                style={{
                  display: 'block', marginBottom: '0.65rem',
                  fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem',
                  color: 'var(--vg-text-2)', textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--vg-gold)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--vg-text-2)')}>
                {label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* Newsletter */}
      <div style={{
        background: 'var(--vg-gold-dim)', border: '1px solid var(--vg-gold-border)',
        padding: '1.5rem', marginBottom: '2.5rem',
        display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{
            fontFamily: 'var(--font-space-mono)', fontSize: '0.52rem',
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--vg-gold)', marginBottom: '0.3rem',
          }}>
            Travel Updates
          </div>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--vg-text-2)', margin: 0 }}>
            Get exclusive Pi rewards and destination news.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0', flexShrink: 0 }}>
          <input
            type="email"
            placeholder="your@email.com"
            style={{
              background: 'var(--vg-bg-card)', border: '1px solid var(--vg-gold-border)',
              borderRight: 'none', padding: '0.65rem 1rem',
              fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem',
              color: 'var(--vg-text)', outline: 'none', width: '200px',
            }}
          />
          <button className="vg-btn-primary" style={{ padding: '0.65rem 1.2rem', fontSize: '0.48rem', flexShrink: 0 }}>
            Subscribe
          </button>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid var(--vg-border)', paddingTop: '1.5rem',
        display: 'flex', flexWrap: 'wrap', gap: '1rem',
        justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{
          fontFamily: 'var(--font-space-mono)', fontSize: '0.5rem',
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--vg-text-3)',
        }}>
          © {new Date().getFullYear()} Va Travel. All rights reserved.
        </span>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <span style={{
            fontFamily: 'var(--font-space-mono)', fontSize: '0.5rem',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'var(--vg-text-3)',
          }}>
            Powered by <span style={{ color: 'var(--vg-gold)' }}>π Pi Network</span>
          </span>
          <div className="vg-badge-outline">
            <span className="dot" />AI-Powered
          </div>
        </div>
      </div>
    </footer>
  );
}
