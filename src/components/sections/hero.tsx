'use client';
// PATH: src/components/sections/hero.tsx
import { useEffect, useRef, useState } from 'react';
import { Search, Hotel, Utensils, MapPin, Bot, ArrowRight } from 'lucide-react';
import Link from 'next/link';

/* ── Three.js Globe — نفس الكرة الأصلية بالضبط ── */
function ThreeGlobe() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Load Three.js dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.async = true;
    script.onload = () => initGlobe();
    document.head.appendChild(script);

    let renderer: any, animId: number;

    function initGlobe() {
      const THREE = (window as any).THREE;
      if (!THREE || !mount) return;

      const W = mount.offsetWidth || 600;
      const H = mount.offsetHeight || 600;

      // Renderer
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.inset = '0';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      mount.appendChild(renderer.domElement);

      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 1000);
      camera.position.set(0, 0, 3.2);

      // Wireframe globe
      const geo     = new THREE.SphereGeometry(1.15, 64, 64);
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0xC9A227, wireframe: true, opacity: 0.08, transparent: true,
      });
      const wireSphere = new THREE.Mesh(geo, wireMat);
      scene.add(wireSphere);

      // Glow sphere
      const glowGeo = new THREE.SphereGeometry(1.18, 32, 32);
      const glowMat = new THREE.MeshBasicMaterial({ color: 0xC9A227, transparent: true, opacity: 0.03 });
      const glow    = new THREE.Mesh(glowGeo, glowMat);
      scene.add(glow);

      // Equator ring
      const ringGeo = new THREE.RingGeometry(1.22, 1.235, 120);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xC9A227, transparent: true, opacity: 0.18, side: THREE.DoubleSide,
      });
      const equator = new THREE.Mesh(ringGeo, ringMat);
      equator.rotation.x = Math.PI / 2;
      scene.add(equator);

      // Tilted orbit ring
      const orbitGeo = new THREE.RingGeometry(1.4, 1.415, 120);
      const orbitMat = new THREE.MeshBasicMaterial({
        color: 0xC9A227, transparent: true, opacity: 0.09, side: THREE.DoubleSide,
      });
      const orbit = new THREE.Mesh(orbitGeo, orbitMat);
      orbit.rotation.x = Math.PI / 3;
      orbit.rotation.z = Math.PI / 6;
      scene.add(orbit);

      // Stars
      const starGeo = new THREE.BufferGeometry();
      const starPos = new Float32Array(2000 * 3);
      for (let i = 0; i < 2000 * 3; i++) starPos[i] = (Math.random() - 0.5) * 80;
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      const starMat = new THREE.PointsMaterial({
        color: 0xC9A227, size: 0.025, transparent: true, opacity: 0.45,
      });
      scene.add(new THREE.Points(starGeo, starMat));

      // City dots
      const cities = [
        { lat: 25.2,  lon: 55.3   }, // Dubai
        { lat: 35.7,  lon: 139.7  }, // Tokyo
        { lat: 48.9,  lon: 2.3    }, // Paris
        { lat: 30.0,  lon: 31.2   }, // Cairo
        { lat: 40.7,  lon: -74.0  }, // New York
        { lat: -8.4,  lon: 115.2  }, // Bali
        { lat: 4.2,   lon: 73.5   }, // Maldives
        { lat: 31.6,  lon: -8.0   }, // Marrakech
      ];
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xE8C255 });
      cities.forEach(c => {
        const phi   = (90 - c.lat) * Math.PI / 180;
        const theta = (c.lon + 180) * Math.PI / 180;
        const r     = 1.16;
        const x     = -(r * Math.sin(phi) * Math.cos(theta));
        const z     =   r * Math.sin(phi) * Math.sin(theta);
        const y     =   r * Math.cos(phi);
        const dot   = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), dotMat);
        dot.position.set(x, y, z);
        wireSphere.add(dot);
      });

      // Mouse parallax
      let mouseX = 0;
      const onMouse = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      };
      window.addEventListener('mousemove', onMouse);

      // Resize
      const onResize = () => {
        if (!mount) return;
        const nW = mount.offsetWidth;
        const nH = mount.offsetHeight;
        camera.aspect = nW / nH;
        camera.updateProjectionMatrix();
        renderer.setSize(nW, nH);
      };
      window.addEventListener('resize', onResize);

      // Animate
      function animate() {
        animId = requestAnimationFrame(animate);
        wireSphere.rotation.y += 0.0018;
        wireSphere.rotation.x += 0.0003;
        glow.rotation.y       -= 0.0008;
        orbit.rotation.z      += 0.0006;
        camera.position.x     += (mouseX * 0.35 - camera.position.x) * 0.04;
        renderer.render(scene, camera);
      }
      animate();

      // Cleanup refs for return
      (mount as any)._cleanup = () => {
        window.removeEventListener('mousemove', onMouse);
        window.removeEventListener('resize', onResize);
        cancelAnimationFrame(animId);
        renderer.dispose();
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      };
    }

    return () => {
      if ((mount as any)._cleanup) (mount as any)._cleanup();
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  );
}

/* ── Tabs ── */
const TABS = [
  { id: 'hotels',      label: 'Hotels',      Icon: Hotel,    href: '/hotels'       },
  { id: 'attractions', label: 'Attractions', Icon: MapPin,   href: '/attractions'  },
  { id: 'restaurants', label: 'Restaurants', Icon: Utensils, href: '/restaurants'  },
  { id: 'ai',          label: 'AI',          Icon: Bot,      href: '/ai' },
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

  useEffect(() => {
    const fn = () => setMob(window.innerWidth < 768);
    fn();
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
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

      {/* Three.js Globe — يملأ الخلفية كلها */}
      <ThreeGlobe />

      {/* Vignette — يغمق الجانب الأيسر عشان النص يُقرأ */}
      <div style={{
        position:   'absolute',
        inset:      0,
        background: 'radial-gradient(ellipse 70% 90% at 15% 50%, rgba(3,2,10,0.92) 0%, rgba(3,2,10,0.55) 45%, transparent 75%)',
        pointerEvents: 'none',
        zIndex:     1,
      }} />

      {/* Content */}
      <div style={{
        position:  'relative',
        zIndex:    2,
        width:     '100%',
        maxWidth:  '1280px',
        margin:    '0 auto',
        padding:   'clamp(2rem,6vw,4rem) clamp(1.25rem,5vw,4rem)',
      }}>
        <div style={{ maxWidth: '580px' }}>

          {/* Tag */}
          <div style={{
            fontFamily:    'var(--font-space-mono)',
            fontSize:      '.55rem',
            letterSpacing: '.4em',
            textTransform: 'uppercase' as const,
            color:         'var(--vg-gold)',
            display:       'flex',
            alignItems:    'center',
            gap:           '1rem',
            marginBottom:  '2.5rem',
          }}>
            Pi-Powered · AI-First · Global
            <span style={{ width: '4rem', height: '1px', background: 'var(--vg-gold)', opacity: .5 }} />
          </div>

          {/* Heading */}
          <h1 style={{
            fontFamily:    'var(--font-cormorant)',
            fontSize:      'clamp(4rem,7.5vw,7rem)',
            fontWeight:    300,
            lineHeight:    .92,
            letterSpacing: '-.01em',
            marginBottom:  '2rem',
            color:         'var(--vg-text)',
          }}>
            The World<br />
            <em style={{ fontStyle: 'italic', color: 'var(--vg-gold)', display: 'block' }}>Awaits</em>
            You
          </h1>

          {/* Sub */}
          <p style={{
            fontFamily:   'var(--font-dm-sans)',
            fontWeight:   300,
            fontSize:     '.95rem',
            color:        'var(--vg-text-2)',
            lineHeight:   1.85,
            maxWidth:     '400px',
            marginBottom: '3rem',
          }}>
            Discover extraordinary destinations. Book with Pi. AI-curated experiences for the discerning traveller.
          </p>

          {/* Search box */}
          <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', marginBottom: '2.5rem' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--vg-border)' }}>
              {TABS.map(({ id, label, Icon }) => {
                const on = tab === id;
                return (
                  <button key={id} onClick={() => setTab(id)} style={{
                    flex:         1,
                    padding:      mob ? '.65rem .2rem' : '.7rem .4rem',
                    background:   on ? 'var(--vg-gold-dim)' : 'none',
                    border:       'none',
                    borderBottom: on ? '2px solid var(--vg-gold)' : '2px solid transparent',
                    cursor:       'pointer',
                    color:        on ? 'var(--vg-gold)' : 'var(--vg-text-3)',
                    display:      'flex',
                    flexDirection:'column' as const,
                    alignItems:   'center',
                    gap:          '.28rem',
                    transition:   'all .2s',
                  }}>
                    <Icon size={mob ? 14 : 13} />
                    {!mob && (
                      <span style={{
                        fontFamily:    'var(--font-space-mono)',
                        fontSize:      '.4rem',
                        letterSpacing: '.14em',
                        textTransform: 'uppercase' as const,
                      }}>
                        {label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Input row */}
            <div style={{ display: 'flex', direction: 'ltr' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '.65rem', padding: '.85rem 1rem' }}>
                <Search size={14} color="var(--vg-text-3)" style={{ flexShrink: 0 }} />
                <input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder={`Search ${cur.label.toLowerCase()}…`}
                  style={{
                    flex:       1,
                    background: 'none',
                    border:     'none',
                    outline:    'none',
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize:   '.88rem',
                    color:      'var(--vg-text)',
                    minWidth:   0,
                  }}
                />
              </div>
              <Link
                href={`/${locale}${cur.href}${q ? `?q=${encodeURIComponent(q)}` : ''}`}
                className="vg-btn-primary"
                style={{
                  textDecoration: 'none',
                  borderLeft:     '1px solid var(--vg-gold-border)',
                  display:        'flex',
                  alignItems:     'center',
                  gap:            '.4rem',
                  padding:        '.85rem 1rem',
                  flexShrink:     0,
                }}
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
      </div>
    </section>
  );
}
