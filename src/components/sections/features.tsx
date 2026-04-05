'use client';
// PATH: src/components/sections/features.tsx
import { useEffect, useRef } from 'react';
import { Sparkles, Globe, ShieldCheck, Zap, CreditCard, HeartHandshake } from 'lucide-react';

const FEATURES = [
  { icon: Sparkles,       title: 'AI-Curated Travel',  desc: 'Personalised recommendations powered by Claude AI, learning your preferences for every journey.' },
  { icon: Globe,          title: 'Global Reach',        desc: '180+ countries, 50,000+ properties, and millions of experiences available at your fingertips.' },
  { icon: CreditCard,     title: 'Pi Payments',         desc: 'Seamlessly book hotels, tours, and dining using Pi Network — the future of travel payments.' },
  { icon: ShieldCheck,    title: 'Verified Listings',   desc: 'Every property and attraction is manually reviewed to ensure the highest quality standards.' },
  { icon: Zap,            title: 'Instant Booking',     desc: 'Real-time availability and confirmed reservations in seconds, no waiting required.' },
  { icon: HeartHandshake, title: 'Concierge Support',   desc: '24/7 multilingual support from human experts and AI to handle every travel request.' },
];

export function FeaturesSection({ locale }: { locale: string }) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.08 }
    );
    const items = sectionRef.current?.querySelectorAll('.vg-reveal') ?? [];
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} style={{ background: 'var(--vg-bg)', padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,7vw,5rem)' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div className="vg-overline vg-reveal" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
          Why Va Travel
        </div>
        <h2 className="vg-display vg-reveal d1" style={{ fontSize: 'clamp(2.2rem,5vw,4rem)' }}>
          Travel <em className="vg-italic">Reimagined</em>
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 0 }}>
        {FEATURES.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.title}
              className={`vg-feat vg-reveal d${(i % 4) + 1}`}
              style={{ border: '1px solid var(--vg-border)' }}
            >
              <div className="vg-feat-icon">
                <Icon size={14} strokeWidth={1.5} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.15rem', fontWeight: 300, color: 'var(--vg-text)', marginBottom: '0.45rem' }}>
                  {feat.title}
                </div>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', color: 'var(--vg-text-2)', lineHeight: 1.7, margin: 0 }}>
                  {feat.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
