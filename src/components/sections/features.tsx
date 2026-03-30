'use client';

import { useEffect, useRef } from 'react';

const steps = [
  { num: '01', icon: '🔍', name: 'Traveler Searches', desc: 'AI reads natural language, mood, and budget instantly.', gold: true },
  { num: '02', icon: '🧠', name: 'AI Curates',        desc: 'Perfect properties selected. Fully automated.',         gold: false },
  { num: '03', icon: 'π',  name: 'Pi Payment',        desc: 'Borderless, instant settlement. No banks.',            gold: false, badge: 'INSTANT' },
  { num: '04', icon: '✈️', name: 'Hotel Confirms',    desc: 'Auto check-in, concierge briefing. All AI.',           gold: false },
  { num: '05', icon: '💰', name: 'You Earn',          desc: '10% hits your wallet. Zero effort from you.',          gold: false, badge: 'AUTO' },
];

export function FeaturesSection({ locale }: { locale: string }) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); }),
      { threshold: 0.07 }
    );
    sectionRef.current?.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="automation"
      style={{
        position: 'relative',
        padding: '7rem 7vw',
        overflow: 'hidden',
        background: 'var(--s2)',
      }}
    >
      {/* Label */}
      <div className="reveal" style={{
        fontFamily: 'monospace', fontSize: '.5rem',
        letterSpacing: '.4em', textTransform: 'uppercase',
        color: 'var(--gold)', marginBottom: '1.3rem',
        display: 'flex', alignItems: 'center', gap: '.7rem',
      }}>
        <span style={{ width: '1.1rem', height: 1, background: 'var(--gold)' }} />
        The Va Engine
      </div>

      {/* Title */}
      <h2 className="reveal d1" style={{
        fontFamily: 'Georgia, serif', fontWeight: 300,
        fontSize: 'clamp(2.4rem,5vw,4.5rem)',
        lineHeight: 1.0, letterSpacing: '-.01em',
        color: 'var(--t1)', marginBottom: '1.2rem',
      }}>
        From Search to Suite —<br/>
        <i style={{ fontStyle: 'italic', color: 'var(--gold)' }}>No Human Required</i>
      </h2>

      <p className="reveal d2" style={{
        fontFamily: 'system-ui, sans-serif', fontSize: '.84rem',
        color: 'var(--t2)', maxWidth: 480, lineHeight: 1.85, marginBottom: '3rem',
      }}>
        Every step automated. Your only role: collect the commission.
      </p>

      {/* Pipeline */}
      <div className="reveal d2" style={{
        display: 'flex',
        background: 'rgba(201,162,39,.04)',
        border: '1px solid rgba(201,162,39,.08)',
        flexWrap: 'wrap',
      }}>
        {steps.map((step, i) => (
          <div
            key={i}
            style={{
              flex: '1 1 160px',
              padding: '1.8rem 1.3rem',
              position: 'relative',
              borderRight: i < steps.length - 1 ? '1px solid rgba(201,162,39,.08)' : 'none',
              borderTop: step.gold ? '2px solid var(--gold)' : '2px solid transparent',
              transition: 'background .3s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(201,162,39,.04)'}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
          >
            {/* Arrow */}
            {i < steps.length - 1 && (
              <div style={{
                position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)',
                background: 'var(--void)',
                border: '1px solid rgba(201,162,39,.18)',
                width: 20, height: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'monospace', fontSize: '.5rem', color: 'var(--gold)',
                zIndex: 1,
              }}>→</div>
            )}

            {/* Badge */}
            {step.badge && (
              <div style={{
                position: 'absolute', top: '.7rem', right: '.7rem',
                background: 'rgba(46,204,138,.1)',
                border: '1px solid rgba(46,204,138,.2)',
                fontFamily: 'monospace', fontSize: '.36rem',
                letterSpacing: '.18em', color: 'var(--green)',
                padding: '.16rem .4rem',
              }}>{step.badge}</div>
            )}

            <div style={{ fontSize: '1.3rem', marginBottom: '.7rem' }}>{step.icon}</div>
            <div style={{ fontFamily: 'monospace', fontSize: '.4rem', letterSpacing: '.3em', color: 'var(--t3)', marginBottom: '.3rem' }}>{step.num}</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '.98rem', color: 'var(--t1)', marginBottom: '.35rem' }}>{step.name}</div>
            <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: '.7rem', color: 'var(--t2)', lineHeight: 1.65 }}>{step.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
