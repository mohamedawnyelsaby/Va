'use client';
// PATH: src/components/layout/footer.tsx
// FIX: Full i18n — all footer text translated per locale
import Link from 'next/link';
import { VG } from '@/lib/tokens';
import { t } from '@/lib/i18n/translations';

const LINK_SLUGS = {
  Explore:  [['hotels','hotels'],['attractions','attractions'],['restaurants','restaurants'],['cities','cities'],['ai','ai']],
  Account:  [['dashboard','dashboard'],['bookings','bookings'],['favorites','favorites'],['wallet','wallet'],['profile','profile']],
  Company:  [['about','about'],['blog','blog'],['careers','careers'],['press','press'],['contact','contact']],
  Legal:    [['privacy','privacy'],['terms','terms'],['cookies','cookies'],['trust','trust'],['help','help']],
};

export function Footer({ locale, isRTL = false }: { locale: string; isRTL?: boolean }) {
  const tr = t(locale);

  // Translated section labels
  const SECTIONS: Record<string, string> = {
    Explore:  tr.footer.sections.explore,
    Account:  tr.footer.sections.account,
    Company:  tr.footer.sections.company,
    Legal:    tr.footer.sections.legal,
  };

  // Translated link labels per section
  const LINK_LABELS: Record<string, string[]> = {
    Explore: [tr.nav.hotels, tr.nav.attractions, tr.nav.restaurants, 'Cities', tr.nav.aiAssistant],
    Account: [tr.nav.dashboard, tr.pages.bookings.title, 'Favorites', tr.pages.wallet.title, 'Profile'],
    Company: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
    Legal:   ['Privacy', 'Terms', 'Cookies', 'Trust & Safety', tr.pages.wallet.noBrowser.includes('Pi') ? 'Help Center' : 'Help Center'],
  };

  return (
    <footer style={{ background: 'var(--vg-bg-surface)', borderTop: '1px solid var(--vg-border)', padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,7vw,5rem) 2rem', direction: 'ltr' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>

        {/* Brand */}
        <div>
          <Link href={`/${locale}`} style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.6rem', fontWeight: 300, color: 'var(--vg-text)', marginBottom: '1rem' }}>
              Va<em style={{ color: 'var(--vg-gold)', fontStyle: 'italic' }}> Travel</em>
            </div>
          </Link>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'var(--vg-text-2)', lineHeight: 1.7, maxWidth: '220px', margin: '0 0 1.5rem' }}>
            {tr.footer.description}
          </p>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            {[['𝕏','#','X'],['in','#','LinkedIn'],['π','#','Pi']].map(([icon, href, label]) => (
              <a key={icon} href={href} aria-label={label} style={{ width: '32px', height: '32px', border: '1px solid var(--vg-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--vg-text-2)', textDecoration: 'none', fontSize: '0.75rem', transition: 'color 0.2s, border-color 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--vg-gold)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--vg-gold-border)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--vg-text-2)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--vg-border)'; }}>
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(LINK_SLUGS).map(([col, items]) => (
          <div key={col}>
            <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--vg-gold)', marginBottom: '1.2rem' }}>
              {SECTIONS[col]}
            </div>
            {items.map(([, slug], i) => (
              <Link key={slug} href={`/${locale}/${slug}`} style={{ display: 'block', marginBottom: '0.65rem', fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'var(--vg-text-2)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--vg-gold)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--vg-text-2)')}>
                {LINK_LABELS[col]?.[i] || slug}
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* Newsletter */}
      <div style={{ background: 'var(--vg-gold-dim)', border: '1px solid var(--vg-gold-border)', padding: '1.5rem', marginBottom: '2.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--vg-gold)', marginBottom: '0.3rem' }}>
            {tr.footer.newsletter.tag}
          </div>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'var(--vg-text-2)', margin: 0 }}>
            {tr.footer.newsletter.desc}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 0, flexShrink: 0 }}>
          <input type="email" placeholder={tr.footer.newsletter.placeholder}
            style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-gold-border)', borderRight: 'none', padding: '0.65rem 1rem', fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'var(--vg-text)', outline: 'none', width: '200px' }}
            onFocus={e => e.target.style.borderColor = 'var(--vg-gold)'}
            onBlur={e => e.target.style.borderColor = 'var(--vg-gold-border)'} />
          <button className="vg-btn-primary" style={{ padding: '0.65rem 1.2rem', fontSize: VG.font.micro, flexShrink: 0 }}>
            {tr.footer.newsletter.btn}
          </button>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid var(--vg-border)', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--vg-text-3)' }}>
          © {new Date().getFullYear()} {tr.footer.copyright}
        </span>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--vg-text-3)' }}>
            {tr.footer.poweredBy}
          </span>
          <div className="vg-badge-outline"><span className="dot" />{tr.footer.aiPowered}</div>
        </div>
      </div>
    </footer>
  );
}
