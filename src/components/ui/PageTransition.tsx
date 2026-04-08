'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname   = usePathname();
  const curtainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = curtainRef.current;
    if (!el) return;
    el.style.animation = 'none';
    void el.offsetHeight;                    // force reflow لإعادة تشغيل الأنيميشن
    el.style.animation = 'vg-curtain 0.85s cubic-bezier(0.76,0,0.24,1) forwards';
  }, [pathname]);

  return (
    <>
      <style>{`
        @keyframes vg-curtain {
          0%   { transform: translateY(-100%); }
          38%  { transform: translateY(0%);    }
          62%  { transform: translateY(0%);    }
          100% { transform: translateY(100%);  }
        }
      `}</style>

      <div
        ref={curtainRef}
        aria-hidden="true"
        style={{
          position:      'fixed',
          inset:         0,
          background:    'linear-gradient(160deg, #6B4C08 0%, #C9A227 45%, #F0D070 65%, #C9A227 85%, #6B4C08 100%)',
          zIndex:        10001,
          pointerEvents: 'none',
          transform:     'translateY(-100%)',
          willChange:    'transform',
        }}
      />

      {children}
    </>
  );
}
