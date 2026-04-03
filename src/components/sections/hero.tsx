// PATH: src/components/sections/hero.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Calendar, Users, ArrowRight } from 'lucide-react';

interface HeroProps { locale: string; }

const DESTINATIONS = [
  'Paris, France', 'Tokyo, Japan', 'Dubai, UAE',
  'New York, USA', 'London, UK', 'Bali, Indonesia',
  'Rome, Italy', 'Sydney, Australia',
];

export function HeroSection({ locale }: HeroProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState('Hotels');
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [guests, setGuests] = useState('2');
  const [placeholder, setPlaceholder] = useState(DESTINATIONS[0]);

  const tabs = ['Hotels', 'Attractions', 'Restaurants', 'Ask AI'];

  // Rotating placeholder
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % DESTINATIONS.length;
      setPlaceholder(DESTINATIONS[i]);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  // Star field canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 0.9 + 0.2,
      a: Math.random(),
      speed: Math.random() * 0.004 + 0.002,
    }));

    let frame: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        s.a += s.speed;
        const alpha = (Math.sin(s.a) * 0.5 + 0.5) * 0.7 + 0.1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,162,39,${alpha})`;
        ctx.fill();
      });
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleSearch = () => {
    if (activeTab === 'Ask AI') {
      router.push(`/${locale}/ai`);
      return;
    }
    const pathMap: Record<string, string> = {
      Hotels: 'hotels', Attractions: 'attractions', Restaurants: 'restaurants',
    };
    const path = pathMap[activeTab] || 'hotels';
    router.push(`/${locale}/${path}${destination ? `?search=${encodeURIComponent(destination)}` : ''}`);
  };

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'var(--vg-bg)',
      }}
    >
      {/* Star canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        aria-hidden="true"
      />

      {/* Radial gold glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          width: '50vw',
          height: '50vw',
          maxWidth: 700,
          background: 'radial-gradient(ellipse, rgba(201,162,39,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 900,
          margin: '0 auto',
          padding: '7rem 7vw 5rem',
          textAlign: 'center',
        }}
      >
        {/* Overline */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.8rem',
            fontFamily: 'var(--font-space-mono), monospace',
            fontSize: '0.55rem',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: 'var(--vg-gold)',
            marginBottom: '2rem',
          }}
        >
          <span style={{ width: 24, height: 1, background: 'var(--vg-gold)', display: 'inline-block' }} />
          AI · Pi Network · 120+ Countries
          <span style={{ width: 24, height: 1, background: 'var(--vg-gold)', display: 'inline-block' }} />
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontWeight: 300,
            fontSize: 'clamp(3rem, 8vw, 7rem)',
            lineHeight: 0.88,
            letterSpacing: '-0.01em',
            color: 'var(--vg-text)',
            marginBottom: '1.8rem',
          }}
        >
          Beyond Every<br />
          <em style={{ color: 'var(--vg-gold)', fontStyle: 'italic' }}>Horizon</em>
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)',
            fontWeight: 300,
            lineHeight: 1.75,
            color: 'var(--vg-text-2)',
            maxWidth: 560,
            margin: '0 auto 3rem',
          }}
        >
          The world's first AI-native travel platform powered by Pi Network.
          Book hotels, attractions and restaurants in seconds.
        </p>

        {/* Search box */}
        <div
          style={{
            background: 'var(--vg-bg-card)',
            border: '1px solid var(--vg-border-2)',
            maxWidth: 780,
            margin: '0 auto',
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              borderBottom: '0.5px solid var(--vg-border)',
            }}
          >
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-space-mono), monospace',
                  fontSize: '0.52rem',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: activeTab === tab ? 'var(--vg-gold)' : 'var(--vg-text-3)',
                  borderBottom: activeTab === tab ? '1px solid var(--vg-gold)' : 'none',
                  marginBottom: activeTab === tab ? '-0.5px' : 0,
                  transition: 'color 0.3s',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Inputs row */}
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
            {/* Destination */}
            <div
              style={{
                flex: 2,
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '1rem 1.2rem',
                borderRight: '0.5px solid var(--vg-border)',
              }}
            >
              <MapPin style={{ width: 14, height: 14, color: 'var(--vg-gold)', flexShrink: 0 }} />
              <input
                type="text"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder={placeholder}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontFamily: 'var(--font-cormorant), serif',
                  fontSize: '1rem',
                  fontWeight: 300,
                  color: 'var(--vg-text)',
                  letterSpacing: '0.02em',
                }}
              />
            </div>

            {/* Check in */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem 1rem',
                borderRight: '0.5px solid var(--vg-border)',
              }}
            >
              <Calendar style={{ width: 13, height: 13, color: 'var(--vg-text-3)', flexShrink: 0 }} />
              <input
                type="date"
                value={checkIn}
                onChange={e => setCheckIn(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: '0.8rem',
                  color: checkIn ? 'var(--vg-text)' : 'var(--vg-text-3)',
                  width: '100%',
                }}
              />
            </div>

            {/* Guests */}
            <div
              style={{
                flex: 0.7,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem 1rem',
                borderRight: '0.5px solid var(--vg-border)',
              }}
            >
              <Users style={{ width: 13, height: 13, color: 'var(--vg-text-3)', flexShrink: 0 }} />
              <input
                type="number"
                min="1"
                max="20"
                value={guests}
                onChange={e => setGuests(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: '0.8rem',
                  color: 'var(--vg-text)',
                  width: '3rem',
                }}
              />
            </div>

            {/* Search button */}
            <button
              onClick={handleSearch}
              className="vg-btn-primary"
              style={{
                padding: '1rem 1.6rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.55rem',
              }}
            >
              <Search style={{ width: 13, height: 13 }} />
              Search
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0',
            marginTop: '4rem',
            flexWrap: 'wrap',
          }}
        >
          {[
            { num: '10K+', label: 'Hotels' },
            { num: '50K+', label: 'Attractions' },
            { num: '120+', label: 'Countries' },
            { num: 'π AI', label: 'Powered' },
          ].map((stat, i, arr) => (
            <div
              key={stat.label}
              style={{
                textAlign: 'center',
                padding: '0 2.5rem',
                borderRight: i < arr.length - 1 ? '0.5px solid var(--vg-border)' : 'none',
              }}
            >
              <div className="vg-stat-num" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
                {stat.num}
              </div>
              <div className="vg-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--vg-text-3)',
          animation: 'float 3s ease-in-out infinite',
        }}
      >
        <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, var(--vg-gold), transparent)' }} />
        <span style={{
          fontFamily: 'var(--font-space-mono), monospace',
          fontSize: '0.45rem',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'var(--vg-text-3)',
        }}>
          Scroll
        </span>
      </div>
    </section>
  );
}
