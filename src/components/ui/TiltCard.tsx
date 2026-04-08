'use client';

import { useRef, useCallback, ReactNode, CSSProperties } from 'react';

interface Props {
  children: ReactNode;
  maxTilt?: number;
  className?: string;
  style?: CSSProperties;
}

export default function TiltCard({ children, maxTilt = 7, className = '', style }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = ((e.clientX - left) / width  - 0.5) * 2;
    const y = ((e.clientY - top)  / height - 0.5) * 2;
    el.style.transform = `perspective(900px) rotateX(${-y * maxTilt}deg) rotateY(${x * maxTilt}deg) scale3d(1.04,1.04,1.04)`;
  }, [maxTilt]);

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{
        ...style,
        transition:       'transform 0.18s ease',
        willChange:       'transform',
        transformStyle:   'preserve-3d',
      }}
    >
      {children}
    </div>
  );
}
