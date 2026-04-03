// PATH: src/components/sections/features.tsx
'use client';

import { useEffect, useRef } from 'react';
import { Globe, Shield, Zap, Brain, CreditCard, Headphones } from 'lucide-react';

const FEATURES = [
  { Icon: Globe,       title: 'Multilingual AI',         desc: 'Full support for 50+ languages with automatic RTL detection and cultural context awareness.' },
  { Icon: Shield,      title: 'Secure Payments',          desc: 'Bank-level encryption with Pi Network blockchain and traditional payment options.' },
  { Icon: Zap,         title: 'Instant Booking',          desc: 'Confirmations in under 3 seconds with our AI-powered availability engine.' },
  { Icon: Brain,       title: 'AI Recommendations',       desc: 'Personalized suggestions based on your preferences, history and travel style.' },
  { Icon: CreditCard,  title: 'Pi Network Integration',   desc: 'Pay with Pi cryptocurrency and earn 2% cashback rewards on every booking.' },
  { Icon: Headphones,  title: '24/7 AI Concierge',        desc: 'Round-the-clock customer support in your native language, always available.' },
];

export function FeaturesSection({ locale }: { locale: string }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll('.vg-reveal');
    if (!els) return;
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.15 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="vg-section">
      {/* Section header */}
      <div className="vg-reveal" style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div className="vg-overline" style={{ justifyContent: 'center', marginBottom: '1.2rem' }}>
          Why Va Travel
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontWeight: 300,
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            color: 'var(--vg-text)',
            lineHeight: 0.95,
            marginBottom: '1rem',
          }}
        >
          Built for the{' '}
          <em style={{ color: 'var(--vg-gold)', fontStyle: 'italic' }}>Discerning</em>
          <br />Traveler
        </h2>
        <p style={{ color: 'var(--vg-text-2)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
          We combine cutting-edge AI with Pi Network payments to deliver a seamless, intelligent travel experience.
        </p>
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '0',
          border: '0.5px solid var(--vg-border)',
        }}
      >
        {FEATURES.map(({ Icon, title, desc }, i) => (
          <div
            key={title}
            className={`vg-feat vg-reveal d${(i % 4) + 1}`}
            style={{
              borderRight: (i + 1) % 3 !== 0 ? '0.5px solid var(--vg-border)' : 'none',
              borderBottom: i < 3 ? '0.5px solid var(--vg-border)' : 'none',
            }}
          >
            <div className="vg-feat-icon">
              <Icon style={{ width: 16, height: 16 }} />
            </div>
            <div>
              <h3 style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontWeight: 400,
                fontSize: '1.05rem',
                color: 'var(--vg-text)',
                marginBottom: '0.4rem',
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
          </div>
        ))}
      </div>
    </section>
  );
}
