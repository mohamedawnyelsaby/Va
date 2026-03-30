'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function HeroSection({ locale }: { locale: string }) {
  const router = useRouter();
  const [searchVal, setSearchVal] = useState('');
  const [hasWebGL, setHasWebGL] = useState(false);

  useEffect(() => {
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
      setHasWebGL(!!gl && gl instanceof WebGLRenderingContext);
    } catch { setHasWebGL(false); }
  }, []);

  const handleSearch = () => {
    const q = searchVal.trim();
    if (!q) { document.getElementById('ai-section')?.scrollIntoView({ behavior: 'smooth' }); return; }
    const input = document.getElementById('ai-input') as HTMLInputElement | null;
    if (input) { input.value = q; }
    document.getElementById('ai-section')?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      document.getElementById('ai-send-btn')?.click();
    }, 400);
  };

  return (
    <>
      {/* Hero */}
      <section
        id="hero"
        style={{
          position: 'relative',
          minHeight: '100vh',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          background: 'var(--void)',
        }}
      >
        {/* CSS Globe fallback */}
        {!hasWebGL && (
          <div style={{
            position: 'absolute',
            right: '-10vw',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 'min(70vw,600px)',
            height: 'min(70vw,600px)',
            pointerEvents: 'none',
          }}>
            {[
              { size: '100%', dur: '40s', dir: 'normal' },
              { size: '75%',  dur: '28s', dir: 'reverse' },
              { size: '55%',  dur: '20s', dir: 'normal' },
              { size: '38%',  dur: '14s', dir: 'reverse' },
            ].map((ring, i) => (
              <div key={i} style={{
                position: 'absolute',
                top: '50%', left: '50%',
                width: ring.size, height: ring.size,
                borderRadius: '50%',
                border: '1px solid rgba(201,162,39,.12)',
                transform: 'translate(-50%,-50%)',
                animation: `spin ${ring.dur} linear ${ring.dir} infinite`,
              }} />
            ))}
            {[
              { top: '25%', left: '62%', size: 8 },
              { top: '38%', left: '78%', size: 6 },
              { top: '55%', left: '55%', size: 10 },
              { top: '65%', left: '72%', size: 8 },
            ].map((dot, i) => (
              <div key={i} style={{
                position: 'absolute',
                top: dot.top, left: dot.left,
                width: dot.size, height: dot.size,
                background: 'var(--gold)',
                borderRadius: '50%',
                boxShadow: '0 0 12px rgba(201,162,39,.6)',
              }} />
            ))}
          </div>
        )}

        {/* Globe canvas (WebGL) */}
        {hasWebGL && (
          <canvas id="globe-canvas" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        )}

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          padding: '0 7vw',
          maxWidth: 680,
        }}>
          {/* Tag */}
          <div style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '.52rem',
            letterSpacing: '.4em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2.2rem',
          }}>
            Pi-Powered · AI-First · Global
            <span style={{ display: 'inline-block', width: '3rem', height: 1, background: 'var(--gold)', opacity: .5 }} />
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'var(--font-serif, Georgia, serif)',
            fontSize: 'clamp(3.5rem,7.5vw,7rem)',
            fontWeight: 300,
            lineHeight: .92,
            letterSpacing: '-.01em',
            color: 'var(--t1)',
            marginBottom: '1.8rem',
          }}>
            Beyond<br/>Every<br/>
            <i style={{ fontStyle: 'italic', color: 'var(--gold)', display: 'block' }}>Horizon</i>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontFamily: 'var(--font-sans, system-ui)',
            fontWeight: 300,
            fontSize: '.92rem',
            color: 'var(--t2)',
            lineHeight: 1.85,
            maxWidth: 400,
            marginBottom: '.8rem',
          }}>
            The first luxury travel platform powered by artificial intelligence and Pi Network.
            Every journey, perfectly orchestrated.
          </p>

          {/* Live indicator */}
          <div style={{
            fontFamily: 'monospace',
            fontSize: '.48rem',
            letterSpacing: '.32em',
            color: 'var(--green)',
            display: 'flex',
            alignItems: 'center',
            gap: '.5rem',
            marginBottom: '2.4rem',
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: 'var(--green)',
              display: 'inline-block',
            }} className="live-dot" />
            AI handles everything. You collect every commission.
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push(`/${locale}/hotels`)}
              style={{
                background: 'var(--gold)', color: 'var(--void)',
                border: 'none', cursor: 'pointer',
                fontFamily: 'monospace', fontSize: '.56rem',
                letterSpacing: '.22em', textTransform: 'uppercase',
                padding: '.9rem 2.2rem',
                transition: 'background .3s, transform .2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold2)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold)'; (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}
            >
              Begin Your Journey
            </button>
            <button
              onClick={() => router.push(`/${locale}/hotels`)}
              style={{
                fontFamily: 'monospace', fontSize: '.56rem',
                letterSpacing: '.2em', textTransform: 'uppercase',
                color: 'var(--t2)', border: 'none', background: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.5rem',
              }}
            >
              <span style={{ width: '1.5rem', height: 1, background: 'currentColor' }} />
              Explore Hotels
            </button>
          </div>

          {/* Hero search */}
          <div style={{
            marginTop: '2rem',
            display: 'flex',
            background: 'rgba(10,8,20,.85)',
            border: '1px solid rgba(201,162,39,.2)',
            backdropFilter: 'blur(16px)',
            maxWidth: 500,
          }}>
            <input
              id="hero-search"
              type="text"
              placeholder="Where do you want to go? Ask Va…"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                fontFamily: 'Georgia, serif', fontSize: '.95rem', fontWeight: 300,
                color: 'var(--t1)', padding: '.85rem 1.1rem', letterSpacing: '.02em',
              }}
            />
            <button
              onClick={handleSearch}
              style={{
                background: 'var(--gold)', color: 'var(--void)',
                border: 'none', cursor: 'pointer',
                fontFamily: 'monospace', fontSize: '.5rem',
                letterSpacing: '.18em', padding: '.85rem 1.2rem',
                whiteSpace: 'nowrap', transition: 'background .3s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold2)'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold)'}
            >
              Ask Va AI →
            </button>
          </div>
        </div>

        {/* Inline CSS for globe spin */}
        <style>{`
          @keyframes spin { to { transform: translate(-50%,-50%) rotate(360deg); } }
        `}</style>
      </section>

      {/* Ticker */}
      <div style={{
        borderTop: '1px solid rgba(201,162,39,.12)',
        borderBottom: '1px solid rgba(201,162,39,.12)',
        background: 'rgba(10,8,20,.92)',
        backdropFilter: 'blur(12px)',
        overflow: 'hidden',
        padding: '.65rem 0',
        position: 'relative',
        zIndex: 3,
      }}>
        <div className="ticker-animate" style={{ display: 'inline-flex', whiteSpace: 'nowrap' }}>
          {[
            'Ahmed booked Aman Tokyo · 190π +19π commission',
            'Santorini, Greece — from 210π',
            'Sarah booked La Mamounia · 155π +15.5π commission',
            'Paris — 3,100+ luxury listings',
            'James booked Al Qasr Dubai · 420π +42π commission',
            'Maldives — Overwater suites from 380π',
            'Omar booked Maldives villa · 380π +38π commission',
            'New York — from 250π / night',
            'Ahmed booked Aman Tokyo · 190π +19π commission',
            'Santorini, Greece — from 210π',
            'Sarah booked La Mamounia · 155π +15.5π commission',
            'Paris — 3,100+ luxury listings',
          ].map((item, i) => (
            <span key={i} style={{
              fontFamily: 'monospace', fontSize: '.52rem',
              letterSpacing: '.18em', textTransform: 'uppercase',
              color: 'rgba(242,238,230,.55)', padding: '0 2.2rem',
            }}>
              <span style={{ color: 'var(--gold)', marginRight: '.4rem' }}>✦</span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
