'use client';
// PATH: src/components/sections/pi-integration.tsx
import { useEffect, useRef } from 'react';
import { Coins, ShieldCheck, Globe, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { t } from '@/lib/i18n/translations';

const PILLAR_ICONS = [Coins, ShieldCheck, Globe, TrendingUp];
const STAT_VALUES  = [47, 190, 0, 100];

function getFont(locale: string, type: 'heading' | 'body') {
  return locale === 'ar'
    ? 'var(--font-cairo)'
    : type === 'heading' ? 'var(--font-cormorant)' : 'var(--font-dm-sans)';
}

export function PiIntegration({ locale }: { locale: string }) {
  const tr   = t(locale);
  const isAr = locale === 'ar';
  const dir  = isAr ? 'rtl' : 'ltr';
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
    <section ref={sectionRef} dir={dir} style={{
      background: 'var(--vg-bg-surface)',
      padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,7vw,5rem)',
    }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div className="vg-overline vg-reveal" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
          {tr.piIntegration.sectionTag}
        </div>
        <h2 className="vg-display vg-reveal d1" style={{
          fontFamily:    getFont(locale, 'heading'),
          fontSize:      isAr ? 'clamp(1.6rem,5vw,3rem)' : 'clamp(2rem,5vw,3.8rem)',
          lineHeight:    isAr ? 1.45 : 1.05,
          fontWeight:    isAr ? 600 : 300,
          letterSpacing: isAr ? 0 : '-0.02em',
        }}>
          {tr.piIntegration.sectionTitle}
        </h2>
        <p className="vg-reveal d2" style={{
          fontFamily:  getFont(locale, 'body'),
          fontSize:    isAr ? '0.95rem' : '0.88rem',
          color:       'var(--vg-text-2)',
          maxWidth:    '500px',
          margin:      '1.2rem auto 0',
          lineHeight:  isAr ? 1.95 : 1.75,
        }}>
          {tr.piIntegration.subheading}
        </p>
      </div>

      {/* Main layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '4rem',
      }}>

        {/* Pi Steps card */}
        <div className="vg-card vg-reveal" style={{ padding: '2rem' }}>
          <div style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.5rem', letterSpacing: '0.25em',
            textTransform: 'uppercase', color: 'var(--vg-gold)',
            marginBottom: '1.8rem', direction: 'ltr',
          }}>
            {tr.piIntegration.sectionTag}
          </div>

          {tr.piIntegration.steps.map((step, i) => (
            <div key={i} className="vg-pi-step" style={{ direction: dir }}>
              <span style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.5rem', letterSpacing: '0.2em',
                color: 'var(--vg-gold)', minWidth: '28px', direction: 'ltr',
              }}>
                0{i + 1}
              </span>
              <p style={{
                fontFamily: getFont(locale, 'body'),
                fontSize:   isAr ? '0.88rem' : '0.8rem',
                color:      'var(--vg-text-2)',
                lineHeight: isAr ? 1.9 : 1.65,
                margin: 0,
              }}>
                {step}
              </p>
            </div>
          ))}

          <Link
            href={`/${locale}/auth/signin`}
            className="vg-btn-primary"
            style={{ marginTop: '1.8rem', display: 'inline-flex', textDecoration: 'none' }}
          >
            {tr.piIntegration.connectBtn}
          </Link>
        </div>

        {/* Pillars grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1px',
          background: 'var(--vg-border)',
          alignSelf: 'start',
        }}>
          {tr.piIntegration.pillars.map((p, i) => {
            const Icon = PILLAR_ICONS[i] || Coins;
            return (
              <div key={p.title} className={`vg-feat vg-reveal d${(i % 4) + 1}`}
                style={{ background: 'var(--vg-bg-card)', direction: dir }}>
                <div className="vg-feat-icon">
                  <Icon size={14} strokeWidth={1.5} />
                </div>
                <div>
                  <div style={{
                    fontFamily:    getFont(locale, 'heading'),
                    fontSize:      isAr ? '1rem' : '1.1rem',
                    fontWeight:    isAr ? 600 : 300,
                    lineHeight:    isAr ? 1.5 : 1.2,
                    color:         'var(--vg-text)',
                    marginBottom:  '0.4rem',
                  }}>
                    {p.title}
                  </div>
                  <p style={{
                    fontFamily: getFont(locale, 'body'),
                    fontSize:   isAr ? '0.86rem' : '0.76rem',
                    color:      'var(--vg-text-2)',
                    lineHeight: isAr ? 1.9 : 1.68,
                    margin: 0,
                  }}>
                    {p.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom stat bar — always LTR numbers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '1rem',
        borderTop: '1px solid var(--vg-border)',
        paddingTop: '2.5rem',
        textAlign: 'center',
        direction: 'ltr',
      }}>
        {tr.piIntegration.stats.map((s, i) => (
          <div key={i} className="vg-reveal">
            <div className="vg-stat-num" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.4rem)' }}>
              <AnimatedCounter
                to={STAT_VALUES[i]}
                suffix={s.suffix}
                duration={STAT_VALUES[i] > 100 ? 1800 : 1200}
              />
            </div>
            <div className="vg-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
