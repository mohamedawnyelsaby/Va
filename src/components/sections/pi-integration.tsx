'use client';
// PATH: src/components/sections/pi-integration.tsx
import { useEffect, useRef } from 'react';
import { Coins, ShieldCheck, Globe, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const PILLARS = [
  { icon: Coins,       title: 'Earn Pi Rewards',     desc: 'Receive Pi for every booking, review, and referral you make on the platform.' },
  { icon: ShieldCheck, title: 'Secure Payments',      desc: 'Pi Network blockchain ensures every transaction is transparent and tamper-proof.' },
  { icon: Globe,       title: 'Global Acceptance',    desc: 'Use Pi at thousands of verified properties and experiences worldwide.' },
  { icon: TrendingUp,  title: 'Growing Ecosystem',    desc: 'Be part of the world\'s largest crypto community with 47M+ active users.' },
];

const PI_STEPS = [
  { step: '01', text: 'Connect your Pi Wallet to your Va Travel account.' },
  { step: '02', text: 'Browse and select from thousands of verified listings.' },
  { step: '03', text: 'Confirm your booking — pay instantly with Pi.' },
  { step: '04', text: 'Travel, earn rewards, and leave verified reviews.' },
];

export function PiIntegration({ locale }: { locale: string }) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.06 }
    );
    sectionRef.current?.querySelectorAll('.vg-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        background: 'var(--vg-bg-surface)',
        padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,7vw,5rem)',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div className="vg-overline vg-reveal" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
          Pi Network Integration
        </div>
        <h2 className="vg-display vg-reveal d1" style={{ fontSize: 'clamp(2rem,5vw,3.8rem)' }}>
          Pay with <em className="vg-italic">Pi</em>
        </h2>
        <p className="vg-reveal d2" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.88rem', color: 'var(--vg-text-2)', maxWidth: '500px', margin: '1.2rem auto 0', lineHeight: 1.75 }}>
          Va Travel is one of the first luxury travel platforms natively integrated with Pi Network payments.
        </p>
      </div>

      {/* Main layout — stacks on mobile */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '4rem',
      }}>
        {/* LEFT — Pi steps card */}
        <div
          className="vg-card vg-reveal"
          style={{ padding: '2rem' }}
        >
          <div style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.5rem', letterSpacing: '0.25em', textTransform: 'uppercase',
            color: 'var(--vg-gold)', marginBottom: '1.8rem',
          }}>
            How to Pay with Pi
          </div>

          {PI_STEPS.map((s) => (
            <div key={s.step} className="vg-pi-step">
              <span style={{
                fontFamily: 'var(--font-space-mono)', fontSize: '0.5rem',
                letterSpacing: '0.2em', color: 'var(--vg-gold)', minWidth: '28px',
              }}>
                {s.step}
              </span>
              <p style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem',
                color: 'var(--vg-text-2)', lineHeight: 1.65, margin: 0,
              }}>
                {s.text}
              </p>
            </div>
          ))}

          <Link
            href={`/${locale}/auth/signin`}
            className="vg-btn-primary"
            style={{ marginTop: '1.8rem', display: 'inline-flex', textDecoration: 'none' }}
          >
            Connect Pi Wallet
          </Link>
        </div>

        {/* RIGHT — Pillars grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1px',
          background: 'var(--vg-border)',
          alignSelf: 'start',
        }}>
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className={`vg-feat vg-reveal d${(i % 4) + 1}`}
                style={{ background: 'var(--vg-bg-card)' }}
              >
                <div className="vg-feat-icon">
                  <Icon size={14} strokeWidth={1.5} />
                </div>
                <div>
                  <div style={{
                    fontFamily: 'var(--font-cormorant)', fontSize: '1.1rem',
                    fontWeight: 300, color: 'var(--vg-text)', marginBottom: '0.4rem',
                  }}>
                    {p.title}
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-dm-sans)', fontSize: '0.76rem',
                    color: 'var(--vg-text-2)', lineHeight: 1.68, margin: 0,
                  }}>
                    {p.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom stat bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '1rem',
        borderTop: '1px solid var(--vg-border)',
        paddingTop: '2.5rem',
        textAlign: 'center',
      }}>
        {[
          { num: '47M+', label: 'Pi Users' },
          { num: '190+', label: 'Countries' },
          { num: '0%',   label: 'Transaction Fees' },
          { num: '100%', label: 'Blockchain Secured' },
        ].map((s) => (
          <div key={s.label} className="vg-reveal">
            <div className="vg-stat-num" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.4rem)' }}>{s.num}</div>
            <div className="vg-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
