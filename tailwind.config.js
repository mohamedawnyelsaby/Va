/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    './src/features/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // ── Void Gold palette ──────────────────────────────
        gold: {
          DEFAULT: '#C9A227',
          light: '#E8C255',
          bright: '#F0D070',
          dark: '#8A6412',
          dim: 'rgba(201,162,39,0.15)',
          glow: 'rgba(201,162,39,0.08)',
        },
        void: {
          DEFAULT: '#03020A',
          surface: '#09080F',
          card: '#0E0C18',
          deep: '#141220',
        },
        // ── Pi kept for payment flows ──────────────────────
        pi: {
          DEFAULT: '#C9A227',
          dark: '#8A6412',
          light: '#E8C255',
        },
        success: { DEFAULT: '#10b981', foreground: '#ffffff' },
        warning: { DEFAULT: '#f59e0b', foreground: '#ffffff' },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
        arabic: ['Cairo', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        'fade-up': {
          from: { opacity: 0, transform: 'translateY(30px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        'gold-pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.4 },
        },
        'ticker-scroll': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        orbit: {
          from: { transform: 'translate(-50%,-50%) rotate(0deg)' },
          to: { transform: 'translate(-50%,-50%) rotate(360deg)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-up': 'fade-up 0.8s ease forwards',
        'gold-pulse': 'gold-pulse 2s infinite',
        'ticker-scroll': 'ticker-scroll 35s linear infinite',
        float: 'float 4s ease-in-out infinite',
        orbit: 'orbit 8s linear infinite',
      },
      screens: {
        xs: '480px',
        '3xl': '1920px',
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #C9A227 0%, #E8C255 100%)',
        'gradient-void': 'linear-gradient(135deg, #03020A 0%, #0E0C18 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
