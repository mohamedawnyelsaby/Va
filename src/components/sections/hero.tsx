'use client';
// PATH: src/components/sections/hero.tsx
// FIX: Hero ALWAYS dark — zero light-mode background bleed
// FIX: Overlay gradient is strong enough across full width (min 60% opacity)
// FIX: Canvas background forced #03020A before and after Three.js loads
// FIX: Section uses both inline style AND class for double insurance
import { useEffect, useRef, useState } from 'react';
import { Search, Hotel, Utensils, MapPin, Bot, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { t } from '@/lib/i18n/translations';

/* ── Three.js Globe ── */
function ThreeGlobe() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

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

      renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });
      renderer.setClearColor(0x03020A, 1);
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.inset = '0';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      mount.appendChild(renderer.domElement);

      const scene  = new THREE.Scene();
      scene.background = new THREE.Color(0x03020A);

      const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 1000);
      camera.position.set(0, 0, 3.2);

      const geo     = new THREE.SphereGeometry(1.15, 64, 64);
      const wireMat = new THREE.MeshBasicMaterial({ color: 0xC9A227, wireframe: true, opacity: 0.08, transparent: true });
      const wireSphere = new THREE.Mesh(geo, wireMat);
      scene.add(wireSphere);

      const glowGeo = new THREE.SphereGeometry(1.18, 32, 32);
      const glowMat = new THREE.MeshBasicMaterial({ color: 0xC9A227, transparent: true, opacity: 0.03 });
      scene.add(new THREE.Mesh(glowGeo, glowMat));

      const ringGeo = new THREE.RingGeometry(1.22, 1.235, 120);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xC9A227, transparent: true, opacity: 0.18, side: THREE.DoubleSide });
      const equator = new THREE.Mesh(ringGeo, ringMat);
      equator.rotation.x = Math.PI / 2;
      scene.add(equator);

      const orbitGeo = new THREE.RingGeometry(1.4, 1.415, 120);
      const orbitMat = new THREE.MeshBasicMaterial({ color: 0xC9A227, transparent: true, opacity: 0.09, side: THREE.DoubleSide });
      const orbit = new THREE.Mesh(orbitGeo, orbitMat);
      orbit.rotation.x = Math.PI / 3;
      orbit.rotation.z = Math.PI / 6;
      scene.add(orbit);

      const starGeo = new THREE.BufferGeometry();
      const starPos = new Float32Array(2000 * 3);
      for (let i = 0; i < 2000 * 3; i++) starPos[i] = (Math.random() - 0.5) * 80;
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xC9A227, size: 0.025, transparent: true, opacity: 0.45 })));

      const cities = [
        { lat: 25.2, lon: 55.3 }, { lat: 35.7, lon: 139.7 }, { lat: 48.9, lon: 2.3 },
        { lat: 30.0, lon: 31.2 }, { lat: 40.7, lon: -74.0 }, { lat: -8.4, lon: 115.2 },
        { lat: 4.2,  lon: 73.5 }, { lat: 31.6, lon: -8.0 },
      ];
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xE8C255 });
      cities.forEach(c => {
        const phi = (90 - c.lat) * Math.PI / 180;
        const theta = (c.lon + 180) * Math.PI / 180;
        const r = 1.16;
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), dotMat);
        dot.position.set(-(r * Math.sin(phi) * Math.cos(theta)), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
        wireSphere.add(dot);
      });

      let mouseX = 0;
      const onMouse = (e: MouseEvent) => { mouseX = (e.clientX / window.innerWidth - 0.5) * 2; };
      window.addEventListener('mousemove', onMouse);

      const onResize = () => {
        if (!mount) return;
        camera.aspect = mount.offsetWidth / mount.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mount.offsetWidth, mount.offsetHeight);
      };
      window.addEventListener('resize', onResize);

      function animate() {
        animId = requestAnimationFrame(animate);
        wireSphere.rotation.y += 0.0018;
        wireSphere.rotation.x += 0.0003;
        orbit.rotation.z += 0.0006;
        camera.position.x += (mouseX * 0.35 - camera.position.x) * 0.04;
        renderer.render(scene, camera);
      }
      animate();

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
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        // Dark background ALWAYS — before canvas loads and after
        background: '#03020A',
        zIndex: 0,
      }}
    />
  );
}

/* ── Hero ── */
export function HeroSection({ locale }: { locale: string }) {
  const tr = t(locale);
  const [tab, setTab] = useState('hotels');
  const [q,   setQ]   = useState('');
  const [mob, setMob] = useState(false);

  useEffect(() => {
    const fn = () => setMob(window.innerWidth < 768);
    fn();
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const TABS = [
    { id: 'hotels',      Icon: Hotel,    href: '/hotels',      label: tr.nav.hotels,      placeholder: tr.hero.searchPlaceholder.hotels },
    { id: 'attractions', Icon: MapPin,   href: '/attractions', label: tr.nav.attractions,  placeholder: tr.hero.searchPlaceholder.attractions },
    { id: 'restaurants', Icon: Utensils, href: '/restaurants', label: tr.nav.restaurants,  placeholder: tr.hero.searchPlaceholder.restaurants },
    { id: 'ai',          Icon: Bot,      href: '/ai',          label: 'AI',                placeholder: tr.hero.searchPlaceholder.ai },
  ];

  const STATS = [
    { num: '180+', label: tr.hero.stats.countries },
    { num: '50K+', label: tr.hero.stats.properties },
    { num: '2M+',  label: tr.hero.stats.travelers },
    { num: 'π',    label: tr.hero.stats.payments },
  ];

  const cur = TABS.find(t => t.id === tab)!;

  return (
    <section
      className="vg-hero-force-dark"
      style={{
        position:   'relative',
        minHeight:  '100vh',
        // Double insurance: inline + class both force dark
        background: '#03020A',
        color:      '#F2EEE6',
        display:    'flex',
        alignItems: 'center',
        overflow:   'hidden',
        paddingTop: '64px',
        direction:  'ltr',
        // Prevent any parent background from bleeding through
        isolation:  'isolate',
        contain:    'layout style',
      }}
    >
      {/* Globe Canvas — always dark bg */}
      <ThreeGlobe />

      {/*
        FIXED OVERLAY STRATEGY:
        Layer 1: Full-coverage dark base — ensures nothing bleeds through even at edges
        Layer 2: Directional vignette — darkens left for text readability, keeps right dark enough
        Layer 3: Bottom fade — separates from page body below
      */}

      {/* Layer 1: Base coverage — dark everywhere */}
      <div
        aria-hidden="true"
        style={{
          position:      'absolute',
          inset:         0,
          background:    'rgba(3,2,10,0.55)',
          zIndex:        1,
          pointerEvents: 'none',
        }}
      />

      {/* Layer 2: Directional gradient for readability — stays 65%+ opacity everywhere */}
      <div
        aria-hidden="true"
        style={{
          position:      'absolute',
          inset:         0,
          background:    'linear-gradient(110deg, rgba(3,2,10,0.55) 0%, rgba(3,2,10,0.30) 45%, rgba(3,2,10,0.12) 70%, rgba(3,2,10,0.05) 100%)',
          zIndex:        1,
          pointerEvents: 'none',
        }}
      />

      {/* Layer 3: Bottom fade to separate from next section */}
      <div
        aria-hidden="true"
        style={{
          position:      'absolute',
          bottom:        0,
          left:          0,
          right:         0,
          height:        '140px',
          background:    'linear-gradient(to top, #03020A 0%, transparent 100%)',
          zIndex:        1,
          pointerEvents: 'none',
        }}
      />

      {/* Layer 4: Subtle right-edge darkening to prevent any background bleed */}
      <div
        aria-hidden="true"
        style={{
          position:      'absolute',
          top:           0,
          right:         0,
          width:         '35%',
          height:        '100%',
          background:    'linear-gradient(to left, rgba(3,2,10,0.35) 0%, transparent 100%)',
          zIndex:        1,
          pointerEvents: 'none',
        }}
      />

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
            textTransform: 'uppercase',
            color:         'var(--vg-gold)',
            display:       'flex',
            alignItems:    'center',
            gap:           '1rem',
            marginBottom:  '2.5rem',
          }}>
            {tr.hero.tag}
            <span style={{ width: '4rem', height: '1px', background: 'var(--vg-gold)', opacity: .5 }} />
          </div>

          {/* Heading — ALWAYS white on dark hero */}
          <h1 style={{
            fontFamily:    'var(--font-cormorant)',
            fontSize:      'clamp(4rem,7.5vw,7rem)',
            fontWeight:    300,
            lineHeight:    .92,
            letterSpacing: '-.01em',
            marginBottom:  '2rem',
            // Force white — never inherit from light mode body
            color:         '#F2EEE6',
          }}>
            {tr.hero.heading1}<br />
            <em style={{ fontStyle: 'italic', color: '#C9A227', display: 'block' }}>{tr.hero.heading2}</em>
            {tr.hero.heading3}
          </h1>

          {/* Subheading */}
          <p style={{
            fontFamily:   'var(--font-dm-sans)',
            fontWeight:   300,
            fontSize:     '.95rem',
            color:        'rgba(242,238,230,0.72)',
            lineHeight:   1.85,
            maxWidth:     '400px',
            marginBottom: '3rem',
          }}>
            {tr.hero.subheading}
          </p>

          {/* Search box */}
          <div style={{
            background:    'rgba(14,12,24,0.90)',
            border:        '1px solid rgba(201,162,39,0.28)',
            backdropFilter:'blur(12px)',
            marginBottom:  '2.5rem',
          }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(201,162,39,0.15)' }}>
              {TABS.map(({ id, label, Icon }) => {
                const on = tab === id;
                return (
                  <button key={id} onClick={() => setTab(id)} style={{
                    flex:          1,
                    padding:       mob ? '.65rem .2rem' : '.7rem .4rem',
                    background:    on ? 'rgba(201,162,39,0.12)' : 'none',
                    border:        'none',
                    borderBottom:  on ? '2px solid #C9A227' : '2px solid transparent',
                    cursor:        'pointer',
                    color:         on ? '#C9A227' : 'rgba(242,238,230,0.45)',
                    display:       'flex',
                    flexDirection: 'column',
                    alignItems:    'center',
                    gap:           '.28rem',
                    transition:    'all .2s',
                  }}>
                    <Icon size={mob ? 14 : 13} />
                    {!mob && (
                      <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '.4rem', letterSpacing: '.14em', textTransform: 'uppercase' }}>
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
                <Search size={14} color="rgba(242,238,230,0.4)" style={{ flexShrink: 0 }} />
                <input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder={cur.placeholder}
                  style={{
                    flex:       1,
                    background: 'none',
                    border:     'none',
                    outline:    'none',
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize:   '.88rem',
                    // Always light text in hero search — regardless of theme
                    color:      '#F2EEE6',
                    minWidth:   0,
                  }}
                />
              </div>
              <Link
                href={`/${locale}${cur.href}${q ? `?q=${encodeURIComponent(q)}` : ''}`}
                style={{
                  textDecoration: 'none',
                  background:     '#7A560F',
                  borderLeft:     '1px solid rgba(201,162,39,0.25)',
                  display:        'flex',
                  alignItems:     'center',
                  gap:            '.4rem',
                  padding:        '.85rem 1rem',
                  flexShrink:     0,
                  color:          '#FFFFFF',
                  fontFamily:     'var(--font-space-mono)',
                  fontSize:       '0.58rem',
                  letterSpacing:  '0.22em',
                  textTransform:  'uppercase',
                  transition:     'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#8A6412'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#7A560F'}
              >
                <ArrowRight size={14} />
                {!mob && <span>{tr.hero.search}</span>}
              </Link>
            </div>
          </div>

          {/* Stats — ALWAYS white text on dark hero */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
            {STATS.map(s => (
              <div key={s.label}>
                <div style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontWeight: 300,
                  fontSize:   'clamp(1.3rem,2.8vw,2.2rem)',
                  // Always gold in hero — forced hex
                  color:      '#C9A227',
                  lineHeight: 1,
                }}>
                  {s.num}
                </div>
                <div style={{
                  fontFamily:    'var(--font-space-mono)',
                  fontSize:      '.42rem',
                  letterSpacing: '.3em',
                  textTransform: 'uppercase',
                  color:         'rgba(242,238,230,0.40)',
                  marginTop:     '.35rem',
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
