'use client';

import Link from 'next/link';

interface FooterProps { locale: string; }

export function Footer({ locale }: FooterProps) {
  const year = new Date().getFullYear();

  const cols = {
    Explore:  ['Hotels', 'Destinations', 'Restaurants', 'Attractions'],
    Platform: ['AI Concierge', 'Pi Payments', 'Owner Dashboard', 'About'],
    Legal:    ['Privacy', 'Terms', 'Support'],
  };

  const links: Record<string, string[]> = {
    Hotels: [`/${locale}/hotels`], Destinations: [`/${locale}/cities`],
    Restaurants: [`/${locale}/restaurants`], Attractions: [`/${locale}/attractions`],
    'AI Concierge': [`/${locale}/ai`], 'Pi Payments': [`/${locale}/wallet`],
    'Owner Dashboard': [`/${locale}/dashboard`], About: [`/${locale}/about`],
    Privacy: [`/${locale}/privacy`], Terms: [`/${locale}/terms`], Support: [`/${locale}/help`],
  };

  return (
    <footer style={{ background: 'var(--s1)', borderTop: '1px solid rgba(201,162,39,.08)' }}>
      <div style={{ padding: '5rem 7vw 2.5rem' }}>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: '3.5rem',
          marginBottom: '3.5rem',
          paddingBottom: '2.5rem',
          borderBottom: '1px solid rgba(201,162,39,.07)',
        }}>
          {/* Brand */}
          <div>
            <div style={{
              fontFamily: 'Georgia, serif', fontSize: '1.65rem',
              fontWeight: 300, letterSpacing: '.1em',
              color: 'var(--t1)', marginBottom: '.9rem',
            }}>
              <b style={{ color: 'var(--gold)', fontWeight: 400 }}>Va</b> Travel
            </div>
            <p style={{
              fontFamily: 'system-ui, sans-serif', fontSize: '.78rem',
              color: 'var(--t2)', lineHeight: 1.75, maxWidth: 265,
            }}>
              The world's first AI-native luxury travel platform, built on Pi Network.
              Where intelligence meets exploration.
            </p>
          </div>

          {/* Columns */}
          {Object.entries(cols).map(([title, items]) => (
            <div key={title}>
              <div style={{
                fontFamily: 'monospace', fontSize: '.46rem',
                letterSpacing: '.35em', textTransform: 'uppercase',
                color: 'var(--gold)', marginBottom: '1.1rem',
              }}>{title}</div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                {items.map(item => (
                  <li key={item}>
                    <Link
                      href={(links[item] || [`/${locale}`])[0]}
                      style={{
                        fontFamily: 'system-ui, sans-serif', fontSize: '.78rem',
                        color: 'var(--t2)', textDecoration: 'none',
                        transition: 'color .3s',
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--t1)'}
                      onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--t2)'}
                    >{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '.46rem', letterSpacing: '.14em', color: 'var(--t3)' }}>
            © {year} Va Travel — Built on Pi Network · 100% Autonomous
          </div>
          <div style={{ display: 'flex', gap: '.6rem' }}>
            {['X', 'in', 'ig', 'π'].map(s => (
              <button
                key={s}
                style={{
                  width: 32, height: 32,
                  border: '1px solid rgba(201,162,39,.18)',
                  background: 'none', cursor: 'pointer',
                  fontFamily: 'monospace', fontSize: '.5rem',
                  color: 'var(--t2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'border-color .3s, color .3s',
                }}
                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'var(--gold)'; b.style.color = 'var(--gold)'; }}
                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'rgba(201,162,39,.18)'; b.style.color = 'var(--t2)'; }}
              >{s}</button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
