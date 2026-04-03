// PATH: src/components/sections/pi-integration.tsx
'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Zap, Shield, TrendingUp, Gift, ArrowRight } from 'lucide-react';

const REWARDS = [
  { label: 'Hotel Bookings',         value: '2% Pi Cashback' },
  { label: 'Attraction Tickets',     value: '1.5% Pi Cashback' },
  { label: 'Restaurant Reservations',value: '1% Pi Cashback' },
  { label: 'Write a Review',         value: '+1 Pi Reward' },
  { label: 'Refer a Friend',         value: '+10 Pi Reward' },
];

const PILLARS = [
  { Icon: Zap,        title: 'Instant Settlement', desc: 'Transactions confirmed in seconds on the Pi blockchain.' },
  { Icon: Shield,     title: 'Cryptographically Secure', desc: 'Every payment verified end-to-end, no chargebacks.' },
  { Icon: TrendingUp, title: 'Cashback Rewards', desc: 'Earn Pi on every booking, automatically credited to your wallet.' },
  { Icon: Gift,       title: 'Referral Program', desc: 'Invite friends and both of you earn Pi rewards.' },
];

export function PiIntegration({ locale }: { locale: string }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll('.vg-reveal');
    if (!els) return;
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="vg-section"
      style={{ background: 'var(--vg-bg-surface)' }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '5rem',
        alignItems: 'start',
      }}
        className="grid-cols-1 lg:grid-cols-2"
      >
        {/* Left — text */}
        <div>
          <div className="vg-reveal">
            <div className="vg-overline" style={{ marginBottom: '1.2rem' }}>
              Pi Network Integration
            </div>
            <h2 style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontWeight: 300,
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              color: 'var(--vg-text)',
              lineHeight: 0.95,
              marginBottom: '1.4rem',
            }}>
              Pay with{' '}
              <em style={{ color: 'var(--vg-gold)', fontStyle: 'italic' }}>π Pi</em>
              <br />Earn Every Time
            </h2>
            <p style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: '0.88rem',
              lineHeight: 1.75,
              color: 'var(--vg-text-2)',
              marginBottom: '2.5rem',
            }}>
              Va Travel is the first luxury travel platform fully integrated with Pi Network. Use your Pi balance to book hotels, attractions, and experiences worldwide — then earn cashback on every transaction.
            </p>
          </div>

          {/* Pillars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--vg-border)' }}>
            {PILLARS.map(({ Icon, title, desc }, i) => (
              <div
                key={title}
                className={`vg-pi-step vg-reveal d${i + 1}`}
              >
                <div style={{
                  width: 34, height: 34, minWidth: 34,
                  border: '0.5px solid var(--vg-gold-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--vg-gold)',
                }}>
                  <Icon style={{ width: 14, height: 14 }} />
                </div>
                <div>
                  <p style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontWeight: 400,
                    fontSize: '1rem',
                    color: 'var(--vg-text)',
                    marginBottom: '0.2rem',
                  }}>
                    {title}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontSize: '0.75rem',
                    color: 'var(--vg-text-2)',
                    lineHeight: 1.55,
                  }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="vg-reveal" style={{ marginTop: '2rem' }}>
            <Link href={`/${locale}/wallet`}>
              <button className="vg-btn-primary">
                Connect Pi Wallet
                <ArrowRight style={{ width: 12, height: 12 }} />
              </button>
            </Link>
          </div>
        </div>

        {/* Right — rewards card */}
        <div className="vg-reveal">
          <div className="vg-card" style={{ padding: '2.5rem', border: '1px solid var(--vg-gold-border)' }}>
            {/* Pi symbol */}
            <div style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: '5rem',
              fontWeight: 300,
              color: 'var(--vg-gold)',
              lineHeight: 1,
              marginBottom: '0.5rem',
              opacity: 0.85,
            }}>
              π
            </div>

            <div className="vg-overline" style={{ marginBottom: '1.5rem' }}>Rewards Program</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--vg-border)' }}>
              {REWARDS.map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.9rem 1rem',
                    background: 'var(--vg-bg-card)',
                    transition: 'background 0.3s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--vg-gold-dim2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--vg-bg-card)')}
                >
                  <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.82rem', color: 'var(--vg-text-2)' }}>
                    {label}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-space-mono), monospace',
                    fontSize: '0.62rem',
                    color: 'var(--vg-gold)',
                    letterSpacing: '0.1em',
                  }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'var(--vg-gold-dim2)',
              border: '0.5px solid var(--vg-gold-border)',
            }}>
              <p style={{
                fontFamily: 'var(--font-space-mono), monospace',
                fontSize: '0.55rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--vg-gold)',
                textAlign: 'center',
              }}>
                🔒 All payments secured by Pi blockchain
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
