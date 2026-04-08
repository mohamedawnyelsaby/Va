'use client';

import { useEffect, useRef, useCallback } from 'react';

const TRAIL_LENGTH    = 12;
const SPRING_STIFF    = 0.14;
const SPRING_DAMP     = 0.78;
const DOT_MAX         = 10;
const DOT_MIN         = 2;
const OPACITY_MAX     = 0.92;
const OPACITY_MIN     = 0.06;

class SpringNode {
  x: number; y: number; vx: number; vy: number;
  constructor(x: number, y: number) {
    this.x = x; this.y = y; this.vx = 0; this.vy = 0;
  }
  springTo(tx: number, ty: number, s: number, d: number) {
    this.vx = (this.vx + (tx - this.x) * s) * d;
    this.vy = (this.vy + (ty - this.y) * s) * d;
    this.x += this.vx;
    this.y += this.vy;
  }
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const STOPS = [[240,208,112],[201,162,39],[138,100,18]] as const;

function trailColor(p: number): string {
  const [r,g,b] = p < 0.5
    ? STOPS[0].map((c,i) => lerp(c, STOPS[1][i], p * 2))
    : STOPS[1].map((c,i) => lerp(c, STOPS[2][i], (p - 0.5) * 2));
  return `rgb(${~~r},${~~g},${~~b})`;
}

export default function GoldenCursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef  = useRef<SpringNode[]>([]);
  const mouseRef  = useRef({ x: -300, y: -300 });
  const rafRef    = useRef<number>(0);
  const activeRef = useRef(false);
  const idleRef   = useRef<ReturnType<typeof setTimeout>>();

  const resize = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.width  = window.innerWidth;
    c.height = window.innerHeight;
  }, []);

  const initNodes = useCallback(() => {
    nodesRef.current = Array.from(
      { length: TRAIL_LENGTH },
      () => new SpringNode(mouseRef.current.x, mouseRef.current.y)
    );
  }, []);

  const draw = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx   = c.getContext('2d')!;
    const nodes = nodesRef.current;
    const n     = nodes.length;

    ctx.clearRect(0, 0, c.width, c.height);

    nodes[0].springTo(mouseRef.current.x, mouseRef.current.y, SPRING_STIFF, SPRING_DAMP);
    for (let i = 1; i < n; i++)
      nodes[i].springTo(nodes[i-1].x, nodes[i-1].y, SPRING_STIFF, SPRING_DAMP);

    if (n >= 2) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(nodes[0].x, nodes[0].y);
      for (let i = 1; i < n; i++) {
        const mx = (nodes[i].x + nodes[i-1].x) / 2;
        const my = (nodes[i].y + nodes[i-1].y) / 2;
        ctx.quadraticCurveTo(nodes[i-1].x, nodes[i-1].y, mx, my);
      }
      ctx.strokeStyle = '#C9A227';
      ctx.lineWidth   = 1.2;
      ctx.globalAlpha = 0.18;
      ctx.stroke();
      ctx.restore();
    }

    for (let i = n - 1; i >= 0; i--) {
      const p = i / (n - 1);
      const r = lerp(DOT_MAX / 2, DOT_MIN / 2, p);
      const o = lerp(OPACITY_MAX, OPACITY_MIN, p);

      if (i === 0) {
        const glow = ctx.createRadialGradient(
          nodes[0].x, nodes[0].y, 0,
          nodes[0].x, nodes[0].y, r * 4
        );
        glow.addColorStop(0, 'rgba(240,208,112,0.25)');
        glow.addColorStop(1, 'rgba(240,208,112,0)');
        ctx.beginPath();
        ctx.arc(nodes[0].x, nodes[0].y, r * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(nodes[i].x, nodes[i].y, r, 0, Math.PI * 2);
      ctx.fillStyle   = trailColor(p);
      ctx.globalAlpha = o;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  const onMove = useCallback((e: MouseEvent) => {
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;

    if (!activeRef.current) {
      activeRef.current = true;
      if (canvasRef.current) canvasRef.current.style.opacity = '1';
    }

    clearTimeout(idleRef.current);
    idleRef.current = setTimeout(() => {
      if (canvasRef.current) canvasRef.current.style.opacity = '0';
      activeRef.current = false;
    }, 2000);
  }, []);

  useEffect(() => {
    // لا تشغّل على الأجهزة اللمسية
    if (window.matchMedia('(pointer: coarse)').matches) return;

    resize();
    initNodes();
    draw();

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('resize',    resize,  { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(idleRef.current);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize',    resize);
    };
  }, [draw, initNodes, onMove, resize]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:      'fixed',
        inset:         0,
        pointerEvents: 'none',
        zIndex:        9999,
        opacity:       0,
        transition:    'opacity 0.6s ease',
      }}
    />
  );
}
