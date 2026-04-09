'use client';
// PATH: src/components/sections/hero.tsx
import { useEffect, useRef, useState } from 'react';
import { Search, Hotel, Utensils, MapPin, Bot, ArrowRight } from 'lucide-react';
import Link from 'next/link';

/* ── Land polygons ── */
const LAND: Array<[number,number,number,number]> = [
  [-25,35,50,72],[-20,-35,55,37],[25,5,145,55],[100,-45,155,10],
  [-140,25,-55,60],[-82,-56,-34,13],[130,30,145,46],[95,-8,141,8],
  [-25,63,-13,66],[-5,48,10,60],[-170,55,-50,75],
];
function land(lat:number,lon:number){
  for(const[a,b,c,d]of LAND)if(lon>=a&&lon<=c&&lat>=b&&lat<=d)return true;
  return false;
}

/* ── Globe ── */
function Globe({ size }: { size: number }) {
  const cv  = useRef<HTMLCanvasElement>(null);
  const rot = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    const el = cv.current;
    if (!el) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;

    el.width  = size;
    el.height = size;

    const cx = size / 2, cy = size / 2, R = size * 0.43;
    const N = 2200, PHI = Math.PI * (3 - Math.sqrt(5));

    const pts = Array.from({ length: N }, (_, i) => {
      const y  = 1 - (i / (N - 1)) * 2;
      const r  = Math.sqrt(1 - y * y);
      const t  = PHI * i;
      const lat = Math.asin(y) * 180 / Math.PI;
      const lon = Math.atan2(Math.sin(t) * r, Math.cos(t) * r) * 180 / Math.PI;
      return { lat, lon, land: land(lat, lon) };
    });

    function draw() {
      ctx!.clearRect(0, 0, size, size);

      // glow ring
      const g = ctx!.createRadialGradient(cx, cy, R * .75, cx, cy, R * 1.1);
      g.addColorStop(0, 'rgba(201,162,39,0.10)');
      g.addColorStop(1, 'rgba(201,162,39,0)');
      ctx!.beginPath();
      ctx!.arc(cx, cy, R * 1.1, 0, Math.PI * 2);
      ctx!.fillStyle = g;
      ctx!.fill();

      // lat lines
      for (const lat of [-60,-30,0,30,60]) {
        const lr = lat * Math.PI / 180;
        const rl = R * Math.cos(lr);
        const yl = cy - R * Math.sin(lr);
        if (rl < 4) continue;
        ctx!.beginPath();
        ctx!.ellipse(cx, yl, rl, rl * .16, 0, 0, Math.PI * 2);
        ctx!.strokeStyle = 'rgba(201,162,39,0.07)';
        ctx!.lineWidth   = .5;
        ctx!.stroke();
      }

      // dots
      for (const p of pts) {
        const lr = p.lat * Math.PI / 180;
        const lo = (p.lon + rot.current) * Math.PI / 180;
        const x3 = Math.cos(lr) * Math.cos(lo);
        const y3 = Math.sin(lr);
        const z3 = Math.cos(lr) * Math.sin(lo);
        if (z3 < -.05) continue;
        const px = cx + R * x3;
        const py = cy - R * y3;
        const dp = Math.max(0, (z3 + 1) / 2);
        ctx!.beginPath();
        if (p.land) {
          ctx!.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(201,162,39,${(.28 + dp * .72).toFixed(2)})`;
        } else {
          ctx!.arc(px, py, .7, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(242,238,230,${(.015 + dp * .055).toFixed(3)})`;
        }
        ctx!.fill();
      }

      // outline
      ctx!.beginPath();
      ctx!.arc(cx, cy, R, 0, Math.PI * 2);
      ctx!.strokeStyle = 'rgba(201,162,39,0.13)';
      ctx!.lineWidth   = .8;
      ctx!.stroke();

      rot.current += .22;
      raf.current  = requestAnimationFrame(draw);
    }

    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [size]);

  return <canvas ref={cv} style={{ display: 'block' }} />;
}

/* ── Stars ── */
function Stars() {
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = cv.current;
    if (!el) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;

    const resize = () => { el.width = el.offsetWidth; el.height = el.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const s = Array.from({ length: 150 }, () => ({
      x:  Math.random(), y: Math.random(),
      r:  Math.random() * 1.1 + .3,
      a:  Math.random(),
      sp: Math.random() * .004 + .001,
      d:  Math.random() > .5 ? 1 : -1,
    }));

    let r = 0;
    const draw = () => {
      ctx.clearRect(0, 0, el.width, el.height);
      for (const p of s) {
        p.a += p.sp * p.d;
        if (p.a > 1 || p.a < .1) p.d *= -1;
        ctx.beginPath();
        ctx.arc(p.x * el.width, p.y * el.height, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,162,39,${p.a.toFixed(2)})`;
        ctx.fill();
      }
      r = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(r); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas
      ref={cv}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
}

/* ── Tabs ── */
const TABS = [
  { id: 'hotels',      label: 'Hotels',      Icon: Hotel,   href: '/hotels'      },
  { id: 'attractions', label: 'Attractions', Icon: MapPin,  href: '/attractions' },
  { id: 'restaurants', label: 'Restaurants', Icon: Utensils,href: '/restaurants' },
  { id: 'ai',          label: 'AI',          Icon: Bot,     href: '/ai-assistant'},
];

const STATS = [
  { num: '180+', label: 'Countries'   },
  { num: '50K+', label: 'Properties'  },
  { num: '2M+',  label: 'Travelers'   },
  { num: 'π',    label: 'Pi Payments' },
];

/* ── Hero ── */
export function HeroSection({ locale }: { locale: string }) {
  const [tab, setTab] = useState('hotels');
  const [q,   setQ]   = useState('');
  const [mob, setMob] = useState(false);

  // حساب الحجم بدون إعادة mount للـ Globe
  const [globeSize, setGlobeSize] = useState(440);

  useEffect(() => {
    const update = () => {
      const isMob = window.innerWidth < 768;
      setMob(isMob);
      setGlobeSize(isMob ? 300 : 440);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const cur = TABS.find(t => t.id === tab)!;

  return (
    <section style={{
      position:   'relative',
      minHeight:  '100vh',
      background: 'var(--vg-bg)',
      display:    'flex',
      alignItems: 'center',
      overflow:   'hidden',
      paddingTop: '64px',
      direction:  'ltr',
    }}>
      <Stars />

      <div style={{
        position:   'absolute', inset: 0,
        background: 'radial-gradient(ellipse 90% 80% at 60% 50%, transparent 35%, var(--vg-bg) 88%)',
        pointerEvents: 'none',
      }} />

      {/* Globe — دايماً موجود، بس موضعه بيتغير */}
      <div style={{
        position:   mob ? 'absolute' : 'static',
        top:        mob ? '50%'      : undefined,
        left:       mob ? '50%'      : undefined,
        transform:  mob ? 'translate(-50%, -45%)' : undefined,
        opacity:    mob ? 0.22       : 1,
        pointerEvents: 'none',
        zIndex:     mob ? 0          : 1,
        display:    mob ? 'block'    : 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Globe size={globeSize} />
      </div>

      <div style={{
        position: 'relative', zIndex: 2,
        width:    '100%', maxWidth: '1280px',
        margin:   '0 auto',
        padding:  'clamp(2rem,6vw,4rem) clamp(1.25rem,5vw,4rem)',
        display:  'grid',
        gridTemplateColumns: mob ? '1fr' : 'minmax(0,1fr) auto',
        gap:      mob ? '2rem' : '5rem',
        alignItems: 'center',
      }}>

        {/* Left col */}
        <div>
          <div className="vg-overline" style={{ marginBottom: '1.4rem' }}>
            Void Gold Travel Intelligence
          </div>

          <h1 className="vg-display" style={{ fontSize: 'clamp(2.6rem,7.5vw,5.8rem)', marginBottom: '1.3rem', lineHeight: .93 }}>
            The World<br /><em className="vg-italic">Awaits</em> You
          </h1>

          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize:   'clamp(.8rem,1.7vw,.93rem)',
            color:      'var(--vg-text-2)',
            lineHeight: 1.78, maxWidth: '430px', marginBottom: '2.2rem',
          }}>
            Discover extraordinary destinations. Book with Pi. AI-curated experiences for the discerning traveller.
          </p>

          {/* Search box */}
          <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', marginBottom: '2.2rem' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--vg-border)' }}>
              {TABS.map(({ id, label, Icon }) => {
                const on = tab === id;
                return (
                  <button key={id} onClick={() => setTab(id)} style={{
                    flex: 1, padding: mob ? '.65rem .2rem' : '.7rem .4rem',
                    background:   on ? 'var(--vg-gold-dim)' : 'none',
                    border:       'none',
                    borderBottom: on ? '2px solid var(--vg-gold)' : '2px solid transparent',
                    cursor: 'pointer',
                    color:  on ? 'var(--vg-gold)' : 'var(--vg-text-3)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.28rem',
                    transition: 'all .2s',
                  }}>
                    <Icon size={mob ? 14 : 13} />
                    {!mob && (
                      <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '.4rem', letterSpacing: '.14em', textTransform: 'uppercase' as const }}>
                        {label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', direction: 'ltr' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '.65rem', padding: '.85rem 1rem' }}>
                <Search size={14} color="var(--vg-text-3)" style={{ flexShrink: 0 }} />
                <input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder={`Search ${cur.label.toLowerCase()}…`}
                  style={{
                    flex: 1, background: 'none', border: 'none', outline: 'none',
                    fontFamily: 'var(--font-dm-sans)', fontSize: '.88rem', color: 'var(--vg-text)', minWidth: 0,
                  }}
                />
              </div>
              <Link
                href={`/${locale}${cur.href}${q ? `?q=${encodeURIComponent(q)}` : ''}`}
                className="vg-btn-primary"
                style={{ textDecoration: 'none', borderLeft: '1px solid var(--vg-gold-border)', display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.85rem 1rem', flexShrink: 0 }}
              >
                <ArrowRight size={14} />
                {!mob && <span>Search</span>}
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
            {STATS.map(s => (
              <div key={s.label}>
                <div className="vg-stat-num" style={{ fontSize: 'clamp(1.3rem,2.8vw,2.2rem)' }}>{s.num}</div>
                <div className="vg-stat-label" style={{ fontSize: '.42rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right col — Globe desktop placeholder (Globe already rendered above absolutely/statically) */}
        {!mob && <div style={{ width: 440, height: 440, flexShrink: 0 }} />}
      </div>
    </section>
  );
}
