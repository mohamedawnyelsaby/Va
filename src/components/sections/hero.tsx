'use client';
// PATH: src/components/sections/hero.tsx
import { useEffect, useRef, useState } from 'react';
import { Search, Hotel, Utensils, MapPin, Bot, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// ─── Land bounding boxes (simplified) ─────────────────────────────────────────
const LAND: Array<[number, number, number, number]> = [
  [-25, 35, 50, 72],   // Europe
  [-20, -35, 55, 37],  // Africa
  [25, 5, 145, 55],    // Asia (main)
  [100, -45, 155, 10], // Australia
  [-170, 55, -50, 75], // North America top
  [-140, 25, -55, 60], // North America main
  [-82, 7, -34, 14],   // Central America / Caribbean
  [-82, -56, -34, 13], // South America
  [130, 30, 145, 46],  // Japan
  [95, -8, 141, 8],    // Indonesia (partial)
  [-25, 63, -13, 66],  // Iceland
  [160, 66, 180, 72],  // Far East Russia
  [-180, 66, -155, 72],
  [-5, 48, 10, 60],    // UK / Ireland area
];

function isOnLand(lat: number, lon: number): boolean {
  for (const [lonMin, latMin, lonMax, latMax] of LAND) {
    if (lon >= lonMin && lon <= lonMax && lat >= latMin && lat <= latMax) return true;
  }
  return false;
}

// ─── Globe Canvas ─────────────────────────────────────────────────────────────
function GlobeCanvas({ isMobile }: { isMobile: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotRef    = useRef(0);
  const frameRef  = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = isMobile ? 280 : 440;
    canvas.width  = size;
    canvas.height = size;
    const cx = size / 2;
    const cy = size / 2;
    const R  = size * 0.44;

    // Generate Fibonacci sphere dots
    const N   = 2400;
    const PHI = Math.PI * (3 - Math.sqrt(5));
    const dots: Array<{ lat: number; lon: number; land: boolean }> = [];
    for (let i = 0; i < N; i++) {
      const y   = 1 - (i / (N - 1)) * 2;
      const r   = Math.sqrt(1 - y * y);
      const theta = PHI * i;
      const x   = Math.cos(theta) * r;
      const z   = Math.sin(theta) * r;
      const lat = Math.asin(y) * (180 / Math.PI);
      const lon = Math.atan2(z, x) * (180 / Math.PI);
      dots.push({ lat, lon, land: isOnLand(lat, lon) });
    }

    function draw() {
      ctx!.clearRect(0, 0, size, size);
      const rot = rotRef.current;

      // Outer glow ring
      const grd = ctx!.createRadialGradient(cx, cy, R * 0.82, cx, cy, R * 1.05);
      grd.addColorStop(0, 'rgba(201,162,39,0.08)');
      grd.addColorStop(1, 'rgba(201,162,39,0)');
      ctx!.beginPath();
      ctx!.arc(cx, cy, R * 1.05, 0, Math.PI * 2);
      ctx!.fillStyle = grd;
      ctx!.fill();

      // Latitude grid lines
      for (let lat = -60; lat <= 60; lat += 30) {
        const latRad = (lat * Math.PI) / 180;
        const rLat   = R * Math.cos(latRad);
        const yLat   = cy + R * Math.sin(latRad);
        if (rLat < 3) continue;
        ctx!.beginPath();
        ctx!.ellipse(cx, yLat, rLat, rLat * 0.18, 0, 0, Math.PI * 2);
        ctx!.strokeStyle = 'rgba(201,162,39,0.07)';
        ctx!.lineWidth = 0.5;
        ctx!.stroke();
      }

      // Dots
      for (const dot of dots) {
        const latRad = (dot.lat * Math.PI) / 180;
        const lonRad = ((dot.lon + rot) * Math.PI) / 180;
        const x3d  = Math.cos(latRad) * Math.cos(lonRad);
        const y3d  = Math.sin(latRad);
        const z3d  = Math.cos(latRad) * Math.sin(lonRad);
        if (z3d < 0) continue; // back face cull
        const px = cx + R * x3d;
        const py = cy - R * y3d;
        const depth = (z3d + 1) / 2;

        if (dot.land) {
          const alpha = 0.35 + depth * 0.65;
          ctx!.beginPath();
          ctx!.arc(px, py, dot.land ? 1.4 : 0.8, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(201,162,39,${alpha.toFixed(2)})`;
          ctx!.fill();
        } else {
          ctx!.beginPath();
          ctx!.arc(px, py, 0.8, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(242,238,230,${(0.02 + depth * 0.06).toFixed(3)})`;
          ctx!.fill();
        }
      }

      // Equator line
      ctx!.beginPath();
      ctx!.ellipse(cx, cy, R, R * 0.18, 0, 0, Math.PI * 2);
      ctx!.strokeStyle = 'rgba(201,162,39,0.12)';
      ctx!.lineWidth = 0.6;
      ctx!.stroke();

      // Outer ring
      ctx!.beginPath();
      ctx!.arc(cx, cy, R, 0, Math.PI * 2);
      ctx!.strokeStyle = 'rgba(201,162,39,0.12)';
      ctx!.lineWidth = 0.8;
      ctx!.stroke();

      rotRef.current += 0.28;
      frameRef.current = requestAnimationFrame(draw);
    }

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [isMobile]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        ...(isMobile
          ? { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.18, pointerEvents: 'none', zIndex: 0 }
          : { position: 'relative', zIndex: 1 }),
      }}
    />
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'hotels',      label: 'Hotels',      icon: Hotel,   href: '/hotels' },
  { id: 'attractions', label: 'Attractions', icon: MapPin,  href: '/attractions' },
  { id: 'restaurants', label: 'Restaurants', icon: Utensils,href: '/restaurants' },
  { id: 'ai',          label: 'Ask AI',      icon: Bot,     href: '/ai-assistant' },
];

const STATS = [
  { num: '180+', label: 'Countries' },
  { num: '50K+', label: 'Properties' },
  { num: '2M+',  label: 'Travelers' },
  { num: 'π',    label: 'Native Payments' },
];

// ─── Stars ────────────────────────────────────────────────────────────────────
function StarCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.2 + 0.3,
      a: Math.random(),
      s: Math.random() * 0.004 + 0.001,
      d: Math.random() > 0.5 ? 1 : -1,
    }));
    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        s.a += s.s * s.d;
        if (s.a > 1 || s.a < 0.1) s.d *= -1;
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,162,39,${s.a.toFixed(2)})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
export function Hero({ locale }: { locale: string }) {
  const [activeTab, setActiveTab]   = useState('hotels');
  const [query,     setQuery]       = useState('');
  const [isMobile,  setIsMobile]    = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const currentTab = TABS.find((t) => t.id === activeTab)!;

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: 'var(--vg-bg)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        paddingTop: '64px',
      }}
    >
      {/* Stars always visible */}
      <StarCanvas />

      {/* Gradient vignette */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 60% 50%, transparent 30%, var(--vg-bg) 85%)', pointerEvents: 'none' }} />

      {/* Mobile globe (background) */}
      {isMobile && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <GlobeCanvas isMobile />
        </div>
      )}

      {/* Main grid */}
      <div style={{
        position: 'relative', zIndex: 2,
        width: '100%', maxWidth: '1280px',
        margin: '0 auto',
        padding: 'clamp(3rem,8vw,5rem) clamp(1.5rem,6vw,4rem)',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr auto',
        gap: isMobile ? '3rem' : '4rem',
        alignItems: 'center',
      }}>

        {/* LEFT — text + search */}
        <div>
          {/* Overline */}
          <div className="vg-overline" style={{ marginBottom: '1.8rem' }}>
            Void Gold Travel Intelligence
          </div>

          {/* Heading */}
          <h1 className="vg-display" style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)', marginBottom: '1.6rem' }}>
            The World<br />
            <em className="vg-italic">Awaits</em> You
          </h1>

          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 'clamp(0.85rem, 2vw, 1rem)', color: 'var(--vg-text-2)', lineHeight: 1.75, maxWidth: '460px', marginBottom: '2.8rem' }}>
            Discover extraordinary destinations. Book with Pi. Curated experiences powered by AI for the discerning traveller.
          </p>

          {/* Search box */}
          <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', marginBottom: '3rem' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--vg-border)' }}>
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      flex: 1, padding: '0.75rem 0.5rem',
                      background: active ? 'var(--vg-gold-dim)' : 'none',
                      border: 'none',
                      borderBottom: active ? '2px solid var(--vg-gold)' : '2px solid transparent',
                      cursor: 'pointer',
                      color: active ? 'var(--vg-gold)' : 'var(--vg-text-3)',
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '0.44rem',
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem',
                      transition: 'all 0.25s',
                    }}
                  >
                    <Icon size={13} />
                    <span className="hidden xs:block">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Input row */}
            <div style={{ display: 'flex', gap: 0 }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.2rem' }}>
                <Search size={14} color="var(--vg-text-3)" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${currentTab.label.toLowerCase()}…`}
                  style={{
                    flex: 1, background: 'none', border: 'none', outline: 'none',
                    fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem',
                    color: 'var(--vg-text)',
                  }}
                />
              </div>
              <Link
                href={`/${locale}${currentTab.href}${query ? `?q=${encodeURIComponent(query)}` : ''}`}
                className="vg-btn-primary"
                style={{ textDecoration: 'none', borderLeft: '1px solid var(--vg-gold-border)' }}
              >
                <ArrowRight size={14} />
                <span className="hidden sm:inline">Search</span>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.2rem' }}>
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="vg-stat-num" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)' }}>{s.num}</div>
                <div className="vg-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — globe (desktop only) */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GlobeCanvas isMobile={false} />
          </div>
        )}
      </div>
    </section>
  );
}
