/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'media', // OS-driven only — no manual class toggling
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '2rem', lg: '4rem', xl: '5rem' },
    },
    extend: {
      colors: {
        border:     'hsl(var(--border))',
        input:      'hsl(var(--input))',
        ring:       'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary:    { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary:  { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive:{ DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted:      { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent:     { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        popover:    { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        card:       { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        // Aligned 1:1 with the CSS custom properties in globals.css
        // (--g / --gl / --gd / --gdim / --gglow) so bg-gold-* and
        // var(--g)-based components render pixel-identical colors.
        gold: {
          DEFAULT: '#C9A227', // = var(--g)
          light:   '#F0C84A', // = var(--gl)
          bright:  '#F7DA82', // extra lighter tint, not in globals.css tokens
          dark:    '#9A7A10', // = var(--gd)
          dim:     'rgba(201,162,39,0.10)',  // = var(--gdim)
          glow:    'rgba(201,162,39,0.28)',  // = var(--gglow)
        },
        // Aligned 1:1 with (--bg / --s1 / --s2 / --s3)
        void: {
          DEFAULT: '#060610', // = var(--bg)
          surface: '#141426', // = var(--s2)
          card:    '#0D0D1C', // = var(--s1), matches .card{background:var(--s1)}
          deep:    '#1C1A32', // = var(--s3)
        },
        pi: { DEFAULT: '#C9A227', dark: '#9A7A10', light: '#F0C84A' },
        success: { DEFAULT: '#10b981', foreground: '#ffffff' },
        warning: { DEFAULT: '#f59e0b', foreground: '#ffffff' },
      },
      fontFamily: {
        serif:   ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        mono:    ['Space Mono', 'monospace'],
        arabic:  ['Cairo', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up':   { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'fade-up':        { from: { opacity: '0', transform: 'translateY(30px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'gold-pulse':     { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.4' } },
        'ticker-scroll':  { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        float:            { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'fade-up':        'fade-up 0.8s ease forwards',
        'gold-pulse':     'gold-pulse 2s infinite',
        'ticker-scroll':  'ticker-scroll 35s linear infinite',
        float:            'float 3.5s ease-in-out infinite',
      },
      screens: { xs: '480px' },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
