'use client';
// PATH: src/components/sections/how-it-works.tsx
import { useEffect, useRef } from 'react';
import { UserCircle, Search, CreditCard, Plane } from 'lucide-react';

const STEPS = [
  { icon: UserCircle, num: '01', title: 'Create Account',   desc: 'Sign up with your Pi Wallet in seconds. No credit card required.' },
  { icon: Search,     num: '02', title: 'Discover',         desc: 'Browse AI-curated hotels, restaurants, and attractions worldwide.' },
  { icon: CreditCard, num: '03', title: 'Book with Pi',     desc: 'Pay seamlessly using Pi Network — the world\'s most accessible crypto.' },
  { icon: Plane,      num: '04', title: 'Travel & Earn',    desc: 'Enjoy your trip and earn Pi rewards for every booking and review.' },
];

const BOTTOM_STATS = [
  { num: '< 60s', label: 'Average booking time' },
  { num: '0%',    label: 'Hidden fees' },
  { num: '24/7',  label: 'Support available' },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.07 }
    );
    sectionRef.current?.querySelectorAll('.vg-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} style={{ background: 'var(--vg-bg)', padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,7vw,5rem)' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div className="vg-overline vg-reveal" style={{ justifyContent: 'center', marginBottom: '1rem' }}>How It Works</div>
        <h2 className="vg-display vg-reveal d1" style={{ fontSize: 'clamp(2rem,5vw,3.8rem)' }}>
          Four Steps to <em className="vg-italic">Adventure</em>
        </h2>
      </div>

      {/* Steps */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1px', background: 'var(--vg-border)', marginBottom: '4rem' }}>
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className={`vg-pi-step vg-reveal d${i + 1}`}
              style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '2rem 1.5rem', background: 'var(--vg-bg-card)' }}
            >
              {/* Number */}
              <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.5rem', letterSpacing: '0.25em', color: 'var(--vg-gold)', marginBottom: '1.2rem' }}>
                {step.num}
              </div>
              {/* Icon */}
              <div className="vg-feat-icon" style={{ marginBottom: '1.1rem' }}>
                <Icon size={14} strokeWidth={1.5} />
              </div>
              {/* Text */}
              <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.25rem', fontWeight: 300, color: 'var(--vg-text)', marginBottom: '0.6rem' }}>
                {step.title}
              </div>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', color: 'var(--vg-text-2)', lineHeight: 1.7, margin: 0 }}>
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Bottom stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem', borderTop: '1px solid var(--vg-border)', paddingTop: '3rem', textAlign: 'center' }}>
        {BOTTOM_STATS.map((s) => (
          <div key={s.label} className="vg-reveal">
            <div className="vg-stat-num">{s.num}</div>
            <div className="vg-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
