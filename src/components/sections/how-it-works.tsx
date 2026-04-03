// PATH: src/components/sections/how-it-works.tsx
'use client';

import { useEffect, useRef } from 'react';
import { Search, CheckCircle, Plane, Star } from 'lucide-react';

const STEPS = [
  {
    num: '01',
    Icon: Search,
    title: 'Search & Discover',
    desc: 'Browse thousands of hotels, attractions, and restaurants worldwide with our AI-powered search engine.',
  },
  {
    num: '02',
    Icon: CheckCircle,
    title: 'Compare & Choose',
    desc: 'Read verified reviews, compare prices, and get AI recommendations tailored to your preferences.',
  },
  {
    num: '03',
    Icon: Plane,
    title: 'Book Instantly',
    desc: 'Confirm your booking in seconds using Pi Network, credit card, or any supported payment method.',
  },
  {
    num: '04',
    Icon: Star,
    title: 'Earn & Return',
    desc: 'Share your experience, write reviews, and earn Pi cashback rewards for every contribution.',
  },
];

export function HowItWorks({ locale }: { locale: string }) {
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
    <section ref={sectionRef} className="vg-section">
      {/* Header */}
      <div className="vg-reveal" style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div className="vg-overline" style={{ justifyContent: 'center', marginBottom: '1.2rem' }}>
          The Process
        </div>
        <h2 style={{
          fontFamily: 'var(--font-cormorant), serif',
          fontWeight: 300,
          fontSize: 'clamp(2rem, 5vw, 4rem)',
          color: 'var(--vg-text)',
          lineHeight: 0.95,
        }}>
          Four Steps to Your<br />
          <em style={{ color: 'var(--vg-gold)', fontStyle: 'italic' }}>Perfect Journey</em>
        </h2>
      </div>

      {/* Steps */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '0',
        border: '0.5px solid var(--vg-border)',
      }}>
        {STEPS.map(({ num, Icon, title, desc }, i) => (
          <div
            key={num}
            className={`vg-reveal d${i + 1}`}
            style={{
              padding: '2.5rem 2rem',
              borderRight: i < STEPS.length - 1 ? '0.5px solid var(--vg-border)' : 'none',
              position: 'relative',
              transition: 'background 0.4s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--vg-gold-dim2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {/* Step number */}
            <div style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: '4rem',
              fontWeight: 300,
              color: 'var(--vg-gold-border)',
              lineHeight: 1,
              marginBottom: '1.2rem',
              userSelect: 'none',
            }}>
              {num}
            </div>

            {/* Icon */}
            <div style={{
              width: 38,
              height: 38,
              border: '0.5px solid var(--vg-gold-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--vg-gold)',
              marginBottom: '1.2rem',
            }}>
              <Icon style={{ width: 16, height: 16 }} />
            </div>

            {/* Text */}
            <h3 style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontWeight: 400,
              fontSize: '1.2rem',
              color: 'var(--vg-text)',
              marginBottom: '0.6rem',
            }}>
              {title}
            </h3>
            <p style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: '0.78rem',
              lineHeight: 1.65,
              color: 'var(--vg-text-2)',
            }}>
              {desc}
            </p>
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div
        className="vg-reveal"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          marginTop: '4rem',
          border: '0.5px solid var(--vg-border)',
        }}
      >
        {[
          { num: '10K+',  label: 'Hotels Worldwide' },
          { num: '50K+',  label: 'Attractions Listed' },
          { num: '120+',  label: 'Countries Covered' },
          { num: '1M+',   label: 'Happy Travelers' },
        ].map(({ num, label }, i, arr) => (
          <div
            key={label}
            style={{
              padding: '2rem',
              textAlign: 'center',
              borderRight: i < arr.length - 1 ? '0.5px solid var(--vg-border)' : 'none',
            }}
          >
            <div className="vg-stat-num">{num}</div>
            <div className="vg-stat-label">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
