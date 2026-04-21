'use client';
// PATH: src/components/sections/hero.tsx
// REDESIGN: Cinematic Noir Luxury — editorial, atmospheric, unforgettable
import { useEffect, useRef, useState, useCallback } from 'react';
import { Search, MapPin, Utensils, Bot, ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';
import { t } from '@/lib/i18n/translations';

/* ─── Animated Mesh Background ─────────────────────────────── */
function MeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      t += 0.003;

      // Animated radial glow orbs
      const orbs = [
        { x: w * 0.18 + Math.sin(t * 0.7) * 60, y: h * 0.3 + Math.cos(t * 0.5) * 40, r: w * 0.32, a: 0.05 },
        { x: w * 0.75 + Math.sin(t * 0.4) * 80, y: h * 0.65 + Math.cos(t * 0.6) * 50, r: w * 0.28, a: 0.04 },
        { x: w * 0.5 + Math.sin(t * 0.3) * 40,  y: h * 0.15,                           r: w * 0.20, a: 0.03 },
      ];

      orbs.forEach(orb => {
        const g = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        g.addColorStop(0, `rgba(212,168,83,${orb.a})`);
        g.addColorStop(0.4, `rgba(180,130,50,${orb.a * 0.4})`);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      });

      // Subtle star field
      ctx.fillStyle = 'rgba(212,168,83,0.55)';
      for (let i = 0; i < 80; i++) {
        const x = ((i * 127.3 + Math.sin(t * 0.1 + i) * 2) % w + w) % w;
        const y = ((i * 83.7  + Math.cos(t * 0.08 + i) * 1.5) % h + h) % h;
        const s = Math.sin(t * 1.5 + i * 0.4) * 0.4 + 0.6;
        ctx.globalAlpha = 0.18 * s;
        ctx.beginPath();
        ctx.arc(x, y, 0.8 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        background: '#06050F',
        zIndex: 0,
      }}
    />
  );
}

/* ─── Floating Destination Chip ─────────────────────────────── */
function DestChip({ city, delay = 0, style = {} }: { city: string; emoji: string; delay?: number; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        position: 'absolute',
        background: 'rgba(13,12,28,0.85)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(212,168,83,0.28)',
        padding: '0.45rem 0.85rem',
        fontFamily: 'var(--font-space-mono)',
        fontSize: '0.54rem',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'rgba(250,247,242,0.75)',
        animation: `float 4s ease-in-out ${delay}s infinite, fade-in 0.8s ease ${delay}s both`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        direction: 'ltr',
        ...style,
      }}
    >
      {city}
    </div>
  );
}

/* ─── Hero Component ─────────────────────────────────────────── */
export function HeroSection({ locale }: { locale: string }) {
  const tr = t(locale);
  const [tab, setTab] = useState('hotels');
  const [q, setQ] = useState('');
  const [mob, setMob] = useState(false);

  useEffect(() => {
    const fn = () => setMob(window.innerWidth < 640);
    fn();
    window.addEventListener('resize', fn, { passive: true });
    return () => window.removeEventListener('resize', fn);
  }, []);

  const TABS = [
    { id: 'hotels',      Icon: MapPin,   href: '/hotels',      label: tr.nav.hotels,     placeholder: tr.hero.searchPlaceholder.hotels },
    { id: 'attractions', Icon: MapPin,   href: '/attractions', label: tr.nav.attractions, placeholder: tr.hero.searchPlaceholder.attractions },
    { id: 'restaurants', Icon: Utensils, href: '/restaurants', label: tr.nav.restaurants, placeholder: tr.hero.searchPlaceholder.restaurants },
    { id: 'ai',          Icon: Bot,      href: '/ai',          label: 'Logy AI',          placeholder: tr.hero.searchPlaceholder.ai },
  ];

  const STATS = [
    { num: '180+', label: tr.hero.stats.countries },
    { num: '50K+', label: tr.hero.stats.properties },
    { num: '47M+', label: 'Pi Pioneers' },
    { num: '2%',   label: 'Pi Cashback' },
  ];

  const DEST_CHIPS = [
    { city: 'Dubai',    emoji: '🇦🇪', style: { top: '22%', right: '8%' },  delay: 0 },
    { city: 'Tokyo',    emoji: '🇯🇵', style: { top: '38%', right: '14%' }, delay: 0.8 },
    { city: 'Paris',    emoji: '🇫🇷', style: { top: '55%', right: '6%' },  delay: 1.6 },
    { city: 'Maldives', emoji: '🌊', style: { top: '68%', right: '18%' }, delay: 2.2 },
  ];

  const cur = TABS.find(tb => tb.id === tab)!;

  return (
    <section
      className="vg-hero-force-dark"
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: '#06050F',
        color: '#FAF7F2',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        paddingTop: '64px',
        direction: 'ltr',
        isolation: 'isolate',
      }}
    >
      {/* Animated canvas background */}
      <MeshBackground />

      {/* Radial vignette overlay */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 0%, rgba(6,5,15,0.7) 100%)',
      }} />

      {/* Left gradient for text legibility */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'linear-gradient(105deg, rgba(6,5,15,0.72) 0%, rgba(6,5,15,0.35) 55%, rgba(6,5,15,0.08) 100%)',
      }} />

      {/* Bottom fade */}
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '180px', zIndex: 1, pointerEvents: 'none',
        background: 'linear-gradient(to top, #06050F 0%, transparent 100%)',
      }} />

      {/* Floating destination chips — desktop only */}
      {!mob && (
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
          {DEST_CHIPS.map(d => (
            <DestChip key={d.city} {...d} />
          ))}
        </div>
      )}

      {/* ── Main Content ── */}
      <div style={{
        position: 'relative', zIndex: 3,
        width: '100%', maxWidth: '1280px',
        margin: '0 auto',
        padding: 'clamp(2.5rem,7vw,5rem) clamp(1.25rem,5vw,4rem)',
      }}>
        <div style={{ maxWidth: '660px' }}>

          {/* Overline */}
          <div style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.56rem',
            letterSpacing: '0.42em',
            textTransform: 'uppercase',
            color: 'var(--vg-gold)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
            opacity: 0,
            animation: 'fade-up 0.8s ease 0.2s both',
          }}>
            <span style={{ width: '2.5rem', height: '1px', background: 'linear-gradient(to right, var(--vg-gold), transparent)', display: 'block' }} />
            Pi-Powered · AI-First · Global Travel
            <span style={{ width: '2.5rem', height: '1px', background: 'linear-gradient(to left, var(--vg-gold), transparent)', display: 'block' }} />
          </div>

          {/* Hero Heading */}
          <h1 style={{
            fontFamily: 'var(--font-cormorant)',
            fontWeight: 300,
            fontSize: 'clamp(3.8rem, 8.5vw, 8rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            marginBottom: '2.5rem',
            color: '#FAF7F2',
            opacity: 0,
            animation: 'fade-up 0.9s ease 0.35s both',
          }}>
            {tr.hero.heading1}
            <br />
            <em style={{
              fontStyle: 'italic',
              color: 'var(--vg-gold)',
              backgroundImage: 'linear-gradient(135deg, #D4A853 0%, #F5CC74 40%, #B8892F 80%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'inline-block',
            }}>
              {tr.hero.heading2}
            </em>
            <br />
            {tr.hero.heading3 && <span style={{ color: '#FAF7F2' }}>{tr.hero.heading3}</span>}
          </h1>

          {/* Subheading */}
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontWeight: 300,
            fontSize: 'clamp(0.88rem, 1.5vw, 1.05rem)',
            color: 'rgba(250,247,242,0.65)',
            lineHeight: 1.85,
            maxWidth: '460px',
            marginBottom: '3rem',
            opacity: 0,
            animation: 'fade-up 0.9s ease 0.50s both',
          }}>
            {tr.hero.subheading}
          </p>

          {/* ── Search Box ── */}
          <div style={{
            opacity: 0,
            animation: 'fade-up 0.9s ease 0.65s both',
          }}>
            <div style={{
              background: 'rgba(13,12,28,0.90)',
              border: '1px solid rgba(212,168,83,0.22)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,168,83,0.06) inset',
              marginBottom: '3rem',
            }}>
              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(212,168,83,0.12)' }}>
                {TABS.map(({ id, label, Icon }) => {
                  const on = tab === id;
                  return (
                    <button key={id} onClick={() => setTab(id)} style={{
                      flex: 1,
                      padding: mob ? '0.75rem 0.3rem' : '0.85rem 0.5rem',
                      background: on ? 'rgba(212,168,83,0.10)' : 'transparent',
                      border: 'none',
                      borderBottom: `2px solid ${on ? 'var(--vg-gold)' : 'transparent'}`,
                      cursor: 'pointer',
                      color: on ? 'var(--vg-gold)' : 'rgba(250,247,242,0.38)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: '0.32rem',
                      transition: 'color 0.2s ease, background 0.2s ease, border-color 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      if (!on) {
                        (e.currentTarget as HTMLButtonElement).style.color = 'rgba(250,247,242,0.65)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!on) {
                        (e.currentTarget as HTMLButtonElement).style.color = 'rgba(250,247,242,0.38)';
                      }
                    }}
                    >
                      <Icon size={mob ? 14 : 13} />
                      {!mob && (
                        <span style={{
                          fontFamily: 'var(--font-space-mono)',
                          fontSize: '0.40rem',
                          letterSpacing: '0.16em',
                          textTransform: 'uppercase',
                        }}>
                          {label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Input row */}
              <div style={{ display: 'flex', direction: 'ltr', alignItems: 'stretch' }}>
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center',
                  gap: '0.75rem', padding: '1rem 1.1rem',
                }}>
                  <Search size={15} color="rgba(250,247,242,0.35)" style={{ flexShrink: 0 }} />
                  <input
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    placeholder={cur.placeholder}
                    style={{
                      flex: 1, background: 'none', border: 'none', outline: 'none',
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.92rem',
                      color: '#FAF7F2',
                      minWidth: 0,
                    }}
                  />
                </div>
                <Link
                  href={`/${locale}${cur.href}${q ? `?q=${encodeURIComponent(q)}` : ''}`}
                  style={{
                    textDecoration: 'none',
                    display: 'flex', alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1rem 1.4rem',
                    flexShrink: 0,
                    background: 'var(--vg-gold)',
                    color: '#09080F',
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.58rem',
                    letterSpacing: '0.26em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    transition: 'background 0.2s ease, box-shadow 0.2s ease',
                    borderLeft: '1px solid rgba(212,168,83,0.20)',
                    boxShadow: '0 4px 20px rgba(212,168,83,0.20)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = '#ECC870';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 28px rgba(212,168,83,0.38)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--vg-gold)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(212,168,83,0.20)';
                  }}
                >
                  <ArrowRight size={14} />
                  {!mob && <span>{tr.hero.search}</span>}
                </Link>
              </div>
            </div>
          </div>

          {/* ── Stats ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
            gap: 'clamp(1rem, 2.5vw, 2rem)',
            opacity: 0,
            animation: 'fade-up 0.9s ease 0.80s both',
          }}>
            {STATS.map((s, i) => (
              <div key={s.label} style={{
                borderLeft: i > 0 ? '1px solid rgba(250,247,242,0.08)' : 'none',
                paddingLeft: i > 0 ? 'clamp(0.75rem, 1.5vw, 1.5rem)' : 0,
              }}>
                <div style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontWeight: 300,
                  fontSize: 'clamp(1.6rem, 3.2vw, 2.8rem)',
                  color: 'var(--vg-gold)',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  backgroundImage: 'linear-gradient(135deg, #D4A853 0%, #F5CC74 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {s.num}
                </div>
                <div style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.44rem',
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                  color: 'rgba(250,247,242,0.32)',
                  marginTop: '0.4rem',
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Style injection */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
