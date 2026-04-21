'use client';
// PATH: src/components/sections/features.tsx
// REDESIGN: Editorial grid layout — asymmetric, cinematic
import { useEffect, useRef } from 'react';
import { Sparkles, Globe, CreditCard, ShieldCheck, Zap, HeartHandshake } from 'lucide-react';
import { t } from '@/lib/i18n/translations';

const ICONS = [Sparkles, Globe, CreditCard, ShieldCheck, Zap, HeartHandshake];

export function FeaturesSection({ locale }: { locale: string }) {
  const tr = t(locale);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.08 }
    );
    sectionRef.current?.querySelectorAll('.vg-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} style={{
      background: 'var(--vg-bg)',
      padding: 'clamp(5rem, 9vw, 8rem) clamp(1.5rem, 7vw, 5rem)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background accent */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: 0, right: 0,
        width: '45%', height: '100%',
        background: 'radial-gradient(ellipse at right top, rgba(212,168,83,0.04) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <div className="vg-overline vg-reveal" style={{ justifyContent: 'center', marginBottom: '1.2rem' }}>
          {tr.features.sectionTag}
        </div>
        <h2 className="vg-display vg-reveal d1" style={{
          fontSize: 'clamp(2.8rem, 6vw, 5.5rem)',
          marginBottom: '1.2rem',
        }}>
          {tr.features.sectionTitle1}{' '}
          <em className="vg-italic">{tr.features.sectionTitle2}</em>
        </h2>
        <p className="vg-reveal d2" style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.92rem',
          color: 'var(--vg-text-2)',
          maxWidth: '500px',
          margin: '0 auto',
          lineHeight: 1.8,
        }}>
          Every journey, elevated by intelligence. Every payment, secured by blockchain.
        </p>
      </div>

      {/* Feature grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
        gap: '1px',
        background: 'var(--vg-border)',
        maxWidth: '1200px',
        margin: '0 auto',
        boxShadow: 'var(--vg-shadow-md)',
      }}>
        {tr.features.items.map((feat, i) => {
          const Icon = ICONS[i] || Sparkles;
          const isLarge = i === 0 || i === 4; // featured cells
          return (
            <div
              key={feat.title}
              className={`vg-reveal d${(i % 4) + 1}`}
              style={{
                background: 'var(--vg-bg-card)',
                padding: 'clamp(1.8rem, 3vw, 2.5rem)',
                display: 'flex', flexDirection: 'column', gap: '1.1rem',
                transition: 'background 0.3s ease, border-color 0.3s ease, transform 0.3s var(--vg-ease)',
                position: 'relative', overflow: 'hidden',
                cursor: 'default',
                gridColumn: isLarge && i === 0 ? 'span 1' : 'span 1',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = 'var(--vg-bg-surface)';
                el.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = 'var(--vg-bg-card)';
                el.style.transform = 'translateY(0)';
              }}
            >
              {/* Hover gold line */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: '2px',
                background: 'linear-gradient(to right, transparent, var(--vg-gold-border), transparent)',
                opacity: 0,
                transition: 'opacity 0.3s ease',
              }}
              className="feat-top-line"
              />

              {/* Icon */}
              <div className="vg-feat-icon" style={{ alignSelf: 'flex-start' }}>
                <Icon size={15} strokeWidth={1.5} />
              </div>

              {/* Text */}
              <div>
                <div style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)',
                  fontWeight: 300,
                  color: 'var(--vg-text)',
                  marginBottom: '0.6rem',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.3,
                }}>
                  {feat.title}
                </div>
                <p style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: 'clamp(0.75rem, 1.8vw, 0.80rem)',
                  color: 'var(--vg-text-2)',
                  lineHeight: 1.75,
                  margin: 0,
                }}>
                  {feat.desc}
                </p>
              </div>

              {/* Number watermark */}
              <div style={{
                position: 'absolute', bottom: '-0.5rem', right: '1.2rem',
                fontFamily: 'var(--font-cormorant)',
                fontSize: '5rem', fontWeight: 300,
                color: 'var(--vg-border)',
                lineHeight: 1, userSelect: 'none',
                pointerEvents: 'none',
                transition: 'color 0.3s ease',
              }}>
                {String(i + 1).padStart(2, '0')}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .vg-feat:hover .feat-top-line { opacity: 1 !important; }
      `}</style>
    </section>
  );
}
