'use client';
// PATH: src/components/layout/BottomNav.tsx
// World-class mobile bottom navigation — transforms website to app

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.FC<{ active: boolean }>;
}

// SVG Icons — pixel-perfect, custom designed
const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
      stroke={active ? 'var(--vg-gold)' : 'currentColor'}
      strokeWidth={active ? '2' : '1.5'}
      fill={active ? 'rgba(201,162,39,0.15)' : 'none'}
      strokeLinejoin="round"
    />
  </svg>
);

const HotelIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect
      x="2" y="6" width="20" height="15" rx="1"
      stroke={active ? 'var(--vg-gold)' : 'currentColor'}
      strokeWidth={active ? '2' : '1.5'}
      fill={active ? 'rgba(201,162,39,0.15)' : 'none'}
    />
    <path
      d="M2 11H22M8 11V21M16 11V21"
      stroke={active ? 'var(--vg-gold)' : 'currentColor'}
      strokeWidth={active ? '2' : '1.5'}
    />
    <path d="M12 3L22 6H2L12 3Z" fill={active ? 'var(--vg-gold)' : 'currentColor'} opacity={active ? 0.5 : 0.3} />
  </svg>
);

const AIIcon = ({ active }: { active: boolean }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <circle
      cx="12" cy="12" r="10"
      fill={active ? 'var(--vg-gold)' : 'var(--vg-gold-dim)'}
      stroke="var(--vg-gold-border)"
      strokeWidth="1"
    />
    <path
      d="M8 12C8 12 9.5 8 12 8C14.5 8 16 12 16 12C16 12 14.5 16 12 16C9.5 16 8 12 8 12Z"
      fill={active ? '#fff' : 'var(--vg-gold)'}
      opacity={active ? 1 : 0.9}
    />
    <circle cx="12" cy="12" r="2" fill={active ? 'var(--vg-gold)' : '#fff'} />
  </svg>
);

const BookingsIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect
      x="3" y="4" width="18" height="18" rx="2"
      stroke={active ? 'var(--vg-gold)' : 'currentColor'}
      strokeWidth={active ? '2' : '1.5'}
      fill={active ? 'rgba(201,162,39,0.15)' : 'none'}
    />
    <path
      d="M16 2V6M8 2V6M3 10H21"
      stroke={active ? 'var(--vg-gold)' : 'currentColor'}
      strokeWidth={active ? '2' : '1.5'}
      strokeLinecap="round"
    />
    <circle cx="8" cy="15" r="1.5" fill={active ? 'var(--vg-gold)' : 'currentColor'} />
    <circle cx="12" cy="15" r="1.5" fill={active ? 'var(--vg-gold)' : 'currentColor'} />
    <circle cx="16" cy="15" r="1.5" fill={active ? 'var(--vg-gold)' : 'currentColor'} />
  </svg>
);

const ProfileIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle
      cx="12" cy="8" r="4"
      stroke={active ? 'var(--vg-gold)' : 'currentColor'}
      strokeWidth={active ? '2' : '1.5'}
      fill={active ? 'rgba(201,162,39,0.15)' : 'none'}
    />
    <path
      d="M4 20C4 17 7.58 14.5 12 14.5C16.42 14.5 20 17 20 20"
      stroke={active ? 'var(--vg-gold)' : 'currentColor'}
      strokeWidth={active ? '2' : '1.5'}
      strokeLinecap="round"
    />
  </svg>
);

export function BottomNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [lastY, setLastY] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Hide on scroll down, show on scroll up — native app behavior
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      if (y < 60) { setVisible(true); return; }
      setVisible(y < lastY || y < 80);
      setLastY(y);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastY]);

  if (!mounted) return null;

  const items = [
    { href: `/${locale}`,            label: 'Home',     Icon: HomeIcon },
    { href: `/${locale}/hotels`,     label: 'Hotels',   Icon: HotelIcon },
    { href: `/${locale}/ai`,         label: 'AI',       Icon: AIIcon },
    { href: `/${locale}/bookings`,   label: 'Bookings', Icon: BookingsIcon },
    { href: `/${locale}/dashboard`,  label: 'Profile',  Icon: ProfileIcon },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}`) return pathname === `/${locale}`;
    return pathname.startsWith(href);
  };

  return (
    <>
      <style>{`
        .vg-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 400;
          display: none;
          padding: 0 12px;
          padding-bottom: env(safe-area-inset-bottom, 8px);
          background: transparent;
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .vg-bottom-nav {
            display: block;
          }
          /* Push content above bottom nav */
          main {
            padding-bottom: calc(72px + env(safe-area-inset-bottom, 8px));
          }
        }

        .vg-bottom-nav-inner {
          background: var(--vg-nav-bg);
          border: 1px solid var(--vg-nav-border);
          border-radius: 20px;
          display: flex;
          align-items: center;
          padding: 6px 4px;
          gap: 2px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow: 0 -4px 40px rgba(0,0,0,0.18), 0 8px 32px rgba(0,0,0,0.12);
          pointer-events: all;
          transform: translateY(${visible ? '0' : 'calc(100% + 20px)'});
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          margin-bottom: 8px;
        }

        :root:not(.dark) .vg-bottom-nav-inner {
          box-shadow: 0 -2px 20px rgba(25,14,5,0.08), 0 8px 32px rgba(25,14,5,0.10), 0 0 0 1px rgba(123,77,9,0.06);
        }

        .vg-nav-tab {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          padding: 8px 4px;
          border-radius: 14px;
          border: none;
          background: none;
          cursor: pointer;
          text-decoration: none;
          position: relative;
          transition: background 0.2s ease, transform 0.15s ease;
          -webkit-tap-highlight-color: transparent;
          min-height: 52px;
        }

        .vg-nav-tab:active {
          transform: scale(0.92);
        }

        .vg-nav-tab.active {
          background: var(--vg-gold-dim);
        }

        :root:not(.dark) .vg-nav-tab.active {
          background: rgba(123,77,9,0.10);
        }

        .vg-nav-tab-label {
          font-family: var(--font-space-mono);
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--vg-text-3);
          transition: color 0.2s;
          white-space: nowrap;
          line-height: 1;
        }

        .vg-nav-tab.active .vg-nav-tab-label {
          color: var(--vg-gold);
        }

        :root:not(.dark) .vg-nav-tab.active .vg-nav-tab-label {
          color: var(--vg-gold-text);
        }

        .vg-nav-tab-icon {
          color: var(--vg-text-3);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .vg-nav-tab.active .vg-nav-tab-icon {
          transform: scale(1.12);
        }

        /* Active pip indicator */
        .vg-nav-tab.active::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--vg-gold);
          animation: navPip 0.3s ease;
        }

        @keyframes navPip {
          from { transform: translateX(-50%) scale(0); opacity: 0; }
          to   { transform: translateX(-50%) scale(1); opacity: 1; }
        }

        /* AI tab special pulse */
        .vg-nav-tab[data-ai="true"]::before {
          content: '';
          position: absolute;
          inset: 4px;
          border-radius: 12px;
          background: radial-gradient(circle, rgba(201,162,39,0.10) 0%, transparent 70%);
          animation: aiGlow 3s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes aiGlow {
          0%, 100% { opacity: 0.3; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        /* Shimmer on nav bar */
        .vg-bottom-nav-inner::before {
          content: '';
          position: absolute;
          top: 0;
          left: 20%;
          right: 20%;
          height: 1px;
          background: linear-gradient(to right, transparent, var(--vg-gold-border), transparent);
          border-radius: 1px;
          pointer-events: none;
        }
        .vg-bottom-nav-inner {
          position: relative;
          overflow: hidden;
        }
      `}</style>

      <nav className="vg-bottom-nav" aria-label="Main navigation">
        <div className="vg-bottom-nav-inner">
          {items.map(({ href, label, Icon }) => {
            const active = isActive(href);
            const isAI = label === 'AI';
            return (
              <Link
                key={href}
                href={href}
                className={`vg-nav-tab${active ? ' active' : ''}`}
                data-ai={isAI ? 'true' : undefined}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
              >
                <span className="vg-nav-tab-icon">
                  <Icon active={active} />
                </span>
                <span className="vg-nav-tab-label">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
