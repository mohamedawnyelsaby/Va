'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface ThemeToggleProps {
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ size = 'md', showLabel = false, className = '' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div
        style={{
          width: size === 'sm' ? 32 : 38,
          height: size === 'sm' ? 32 : 38,
          borderRadius: 10,
          background: 'transparent',
        }}
      />
    );
  }

  const isDark = theme === 'dark';
  const btnSize = size === 'sm' ? 32 : 38;
  const iconSize = size === 'sm' ? 15 : 17;

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={className}
      style={{
        width: btnSize,
        height: btnSize,
        borderRadius: 10,
        border: '0.5px solid var(--vt-border-2)',
        background: 'var(--vt-bg-surface)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: 0,
        transition: 'background 0.18s ease, border-color 0.18s ease, transform 0.1s ease',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--vt-bg-deep)';
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--vt-bg-surface)';
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--vt-text-2)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition: 'opacity 0.2s ease, transform 0.3s ease',
          transform: isDark ? 'rotate(-30deg) scale(0)' : 'rotate(0deg) scale(1)',
          opacity: isDark ? 0 : 1,
          position: 'absolute',
        }}
      >
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2"  x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22" />
        <line x1="4.22"  y1="4.22"  x2="5.64"  y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="2"  y1="12" x2="4"  y2="12" />
        <line x1="20" y1="12" x2="22" y2="12" />
        <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36" />
        <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22" />
      </svg>

      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--vt-text-2)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition: 'opacity 0.2s ease, transform 0.3s ease',
          transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(30deg) scale(0)',
          opacity: isDark ? 1 : 0,
          position: 'absolute',
        }}
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>

      {showLabel && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--vt-text-2)',
            marginLeft: iconSize + 4,
            whiteSpace: 'nowrap',
          }}
        >
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
}
