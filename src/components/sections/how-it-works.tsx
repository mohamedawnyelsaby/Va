'use client';
// PATH: src/components/sections/how-it-works.tsx
import { useEffect, useRef } from 'react';
import { UserCircle, Search, CreditCard, Plane } from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { t } from '@/lib/i18n/translations';

const STEP_ICONS = [UserCircle, Search, CreditCard, Plane];

export function HowItWorks({ locale }: { locale: string }) {
  const tr = t(locale);
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
        <div className="vg-overline vg-reveal" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
          {tr.howItWorks.sectionTag}
        </div>
        <h2 className="vg-display vg-reveal d1" style={{ fontSize: 'clamp(2rem,5vw,3.8rem)' }}>
          {tr.howItWorks.sectionTitle1} <em className="vg-italic">{tr.howItWorks.sectionTitle2}</em>
        </h2>
      </div>

      {/* Steps */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1px', background: 'var(--vg-border)', marginBottom: '4rem' }}>
        {tr.howItWorks.steps.map((step, i) => {
          const Icon = STEP_ICONS[i] || UserCircle;
          return (
            <div
              key={step.num}
              className={`vg-pi-step vg-reveal d${i + 1}`}
              style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '2rem 1.5rem', background: 'var(--vg-bg-card)' }}
            >
              <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.5rem', letterSpacing: '0.25em', color: 'var(--vg-gold)', marginBottom: '1.2rem' }}>
                {step.num}
              </div>
              <div className="vg-feat-icon" style={{ marginBottom: '1.1rem' }}>
                <Icon size={14} strokeWidth={1.5} />
              </div>
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
        <div className="vg-reveal">
          <div className="vg-stat-num">{tr.howItWorks.stats.bookingTime}</div>
          <div className="vg-stat-label">{tr.howItWorks.stats.bookingTimeLabel}</div>
        </div>
        <div className="vg-reveal d1">
          <div className="vg-stat-num">{tr.howItWorks.stats.hiddenFees}</div>
          <div className="vg-stat-label">{tr.howItWorks.stats.hiddenFeesLabel}</div>
        </div>
        <div className="vg-reveal d2">
          <div className="vg-stat-num">{tr.howItWorks.stats.support}</div>
          <div className="vg-stat-label">{tr.howItWorks.stats.supportLabel}</div>
        </div>
      </div>
    </section>
  );
}
