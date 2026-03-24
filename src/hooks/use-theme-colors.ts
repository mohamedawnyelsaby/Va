'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * All Va Travel design tokens, resolved for current theme.
 * Use this hook when you need colors in inline styles or canvas/SVG.
 */
export function useThemeColors() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  return {
    isDark,
    mounted,

    /* Backgrounds */
    bg:         isDark ? '#09091A' : '#F2F2F7',
    bgCard:     isDark ? '#151530' : '#FFFFFF',
    bgSurface:  isDark ? '#1A1A35' : '#E8E8EE',
    bgDeep:     isDark ? '#21213E' : '#DDDDE8',

    /* Text */
    text:       isDark ? '#F0F0FF'              : '#111118',
    text2:      isDark ? 'rgba(240,240,255,.55)': '#55555E',
    text3:      isDark ? 'rgba(240,240,255,.30)': '#99999F',

    /* Brand (purple) */
    brand:      isDark ? '#9B7FFF' : '#7C5CFC',
    brandHover: isDark ? '#B09AFF' : '#6D4EE8',
    brandBg:    isDark ? 'rgba(155,127,255,.12)' : 'rgba(124,92,252,.09)',
    brandText:  isDark ? '#C4AAFF' : '#5B3ED4',

    /* Pi (gold) */
    pi:         isDark ? '#F4C775' : '#CA8A04',
    piBg:       isDark ? 'rgba(244,199,117,.10)' : 'rgba(234,179,8,.10)',

    /* Success / OK (teal-green) */
    ok:         isDark ? '#5DCAA5' : '#0B5E49',
    okBg:       isDark ? 'rgba(93,202,165,.10)'  : 'rgba(29,158,117,.10)',

    /* Star rating */
    star:       isDark ? '#F4C775' : '#D97706',

    /* Borders */
    border:     isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.07)',
    border2:    isDark ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.12)',

    /* Nav */
    navBg:      isDark ? '#0D0D22' : '#FFFFFF',
    navBorder:  isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)',
  };
}

/**
 * Shorthand — just returns isDark boolean.
 * Useful when you only need conditional classes.
 */
export function useIsDark(): boolean {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return mounted && resolvedTheme === 'dark';
}
