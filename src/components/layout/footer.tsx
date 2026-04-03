// PATH: src/components/layout/footer.tsx
'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

interface FooterProps { locale: string; }

export function Footer({ locale }: FooterProps) {
  const year = new Date().getFullYear();

  const cols = [
    {
      title: 'Explore',
      links: [
        { label: 'Hotels',      href: `/${locale}/hotels` },
        { label: 'Attractions', href: `/${locale}/attractions` },
        { label: 'Restaurants', href: `/${locale}/restaurants` },
        { label: 'Cities',      href: `/${locale}/cities` },
        { label: 'AI Concierge', href: `/${locale}/ai` },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About',    href: `/${locale}/about` },
        { label: 'Careers',  href: `/${locale}/careers` },
        { label: 'Press',    href: `/${locale}/press` },
        { label: 'Blog',     href: `/${locale}/blog` },
        { label: 'Contact',  href: `/${locale}/contact` },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: `/${locale}/help` },
        { label: 'Safety',      href: `/${locale}/safety` },
        { label: 'Terms',       href: `/${locale}/terms` },
        { label: 'Privacy',     href: `/${locale}/privacy` },
        { label: 'Cookies',     href: `/${locale}/cookies` },
      ],
    },
  ];

  const socials = [
    { Icon: Facebook,  href: 'https://facebook.com' },
    { Icon: Twitter,   href: 'https://twitter.com' },
    { Icon: Instagram, href: 'https://instagram.com' },
    { Icon: Linkedin,  href: 'https://linkedin.com' },
    { Icon: Mail,      href: 'mailto:support@vatravel.com' },
  ];

  return (
    <footer
      style={{
        background: 'var(--vg-bg-surface)',
        borderTop: '0.5px solid var(--vg-border)',
        padding: '4rem 7vw 2rem',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '3rem', marginBottom: '3rem' }}
        className="grid-cols-1 md:grid-cols-4">

        {/* Brand */}
        <div>
          <div style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontSize: '1.8rem',
            fontWeight: 300,
            letterSpacing: '0.15em',
            color: 'var(--vg-text)',
            marginBottom: '1rem',
          }}>
            <span style={{ color: 'var(--vg-gold)' }}>Va</span> Travel
          </div>
          <p style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: '0.8rem',
            lineHeight: 1.7,
            color: 'var(--vg-text-2)',
            maxWidth: '22rem',
            marginBottom: '1.5rem',
          }}>
            The world's first AI-native luxury travel platform. Discover destinations, book experiences, and pay with Pi Network.
          </p>

          {/* Pi badge */}
          <div className="vg-badge-outline" style={{ display: 'inline-flex' }}>
            <span className="dot" />
            Pi Network Accepted
          </div>
        </div>

        {/* Link columns */}
        {cols.map(col => (
          <div key={col.title}>
            <p
              className="vg-overline"
              style={{ marginBottom: '1.2rem', fontSize: '0.55rem' }}
            >
              {col.title}
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {col.links.map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    style={{
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                      fontSize: '0.82rem',
                      color: 'var(--vg-text-2)',
                      textDecoration: 'none',
                      transition: 'color 0.3s',
                    }}
                    onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--vg-gold)')}
                    onMouseLeave={e => ((e.target as HTMLElement).style.color = 'var(--vg-text-2)')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: '0.5px', background: 'var(--vg-border)', margin: '2rem 0' }} />

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <p style={{ fontFamily: 'var(--font-space-mono), monospace', fontSize: '0.55rem', letterSpacing: '0.18em', color: 'var(--vg-text-3)', textTransform: 'uppercase' }}>
          © {year} Va Travel — Made with care by Mohamed Awny
        </p>

        {/* Socials */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          {socials.map(({ Icon, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: 30, height: 30,
                border: '0.5px solid var(--vg-border-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--vg-text-3)',
                transition: 'border-color 0.3s, color 0.3s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'var(--vg-gold-border)';
                el.style.color = 'var(--vg-gold)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'var(--vg-border-2)';
                el.style.color = 'var(--vg-text-3)';
              }}
            >
              <Icon style={{ width: 13, height: 13 }} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
