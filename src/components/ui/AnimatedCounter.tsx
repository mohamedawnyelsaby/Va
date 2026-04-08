'use client';

import { useEffect, useRef, useState, CSSProperties } from 'react';

interface Props {
  to:        number;
  duration?: number;
  suffix?:   string;
  prefix?:   string;
  className?: string;
  style?:    CSSProperties;
}

export default function AnimatedCounter({
  to,
  duration = 1600,
  suffix   = '',
  prefix   = '',
  className,
  style,
}: Props) {
  const [value,   setValue]   = useState(0);
  const elRef     = useRef<HTMLSpanElement>(null);
  const started   = useRef(false);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;

        const startTime = performance.now();
        const tick = (now: number) => {
          const p      = Math.min((now - startTime) / duration, 1);
          const eased  = 1 - Math.pow(1 - p, 3);          // ease-out cubic
          setValue(Math.round(eased * to));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [to, duration]);

  return (
    <span ref={elRef} className={className} style={style}>
      {prefix}{value.toLocaleString()}{suffix}
    </span>
  );
}
