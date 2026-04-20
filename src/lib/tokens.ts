// PATH: src/lib/tokens.ts
// ═══════════════════════════════════════════════════════════════
// Va Travel — Cinematic Noir Luxury Design Token System
// ═══════════════════════════════════════════════════════════════

export const VG = {

  // ── Typography ──────────────────────────────────────────────
  font: {
    micro:   '0.62rem',   // 9.9px — absolute minimum (labels/badges)
    tiny:    '0.70rem',   // 11.2px — sub-labels, timestamps
    small:   '0.80rem',   // 12.8px — secondary text
    body:    '0.875rem',  // 14px   — main body DM Sans
    bodyLg:  '0.95rem',   // 15.2px — emphasized body
    button:  '0.62rem',   // 9.9px  — Space Mono buttons
    nav:     '0.62rem',   // 9.9px  — nav links
  },

  // ── Letter Spacing ──────────────────────────────────────────
  tracking: {
    wide:   '0.32em',   // overlines, section labels
    normal: '0.22em',   // buttons, nav
    tight:  '0.12em',   // inline badges, small labels
  },

  // ── Spacing ─────────────────────────────────────────────────
  space: {
    '1': '0.25rem', '2': '0.5rem',  '3': '0.75rem',
    '4': '1rem',    '5': '1.25rem', '6': '1.5rem',
    '8': '2rem',    '10': '2.5rem', '12': '3rem',
    '16': '4rem',   '20': '5rem',
  },

  // ── Responsive Section Padding ─────────────────────────────
  section: {
    x:   'clamp(1.5rem, 7vw, 5rem)',
    y:   'clamp(3rem, 6vw, 5rem)',
    yLg: 'clamp(5rem, 9vw, 8rem)',
  },

  // ── Transition ──────────────────────────────────────────────
  transition: {
    fast:   'all 0.15s ease',
    normal: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
    slow:   'all 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
    color:  'color 0.2s ease, border-color 0.2s ease, background 0.2s ease',
  },

  // ── Z-index ─────────────────────────────────────────────────
  z: {
    base: 1, card: 2, overlay: 3,
    nav: 500, modal: 600,
    cursor: 9997, grain: 9999,
  },

} as const;

// ── Reusable inline style objects ────────────────────────────

export const monoLabel: React.CSSProperties = {
  fontFamily:    'var(--font-space-mono)',
  fontSize:      VG.font.micro,
  letterSpacing: VG.tracking.tight,
  textTransform: 'uppercase',
  color:         'var(--vg-text-3)',
};

export const monoLabelGold: React.CSSProperties = {
  ...monoLabel,
  color:         'var(--vg-gold)',
  letterSpacing: VG.tracking.wide,
};

export const overlineStyle: React.CSSProperties = {
  fontFamily:    'var(--font-space-mono)',
  fontSize:      VG.font.micro,
  letterSpacing: VG.tracking.wide,
  textTransform: 'uppercase',
  color:         'var(--vg-gold)',
  display:       'flex',
  alignItems:    'center',
  gap:           '0.85rem',
};

export const cardBase: React.CSSProperties = {
  background:   'var(--vg-bg-card)',
  border:       '1px solid var(--vg-border)',
  boxShadow:    'var(--vg-shadow-card)',
  transition:   'border-color 0.3s ease, box-shadow 0.3s ease',
};

export const statNum: React.CSSProperties = {
  fontFamily:    'var(--font-cormorant)',
  fontWeight:    300,
  fontSize:      'clamp(2rem, 4vw, 3.5rem)',
  color:         'var(--vg-gold)',
  lineHeight:    0.92,
  letterSpacing: '-0.02em',
};

export const inputBase: React.CSSProperties = {
  width:       '100%',
  boxSizing:   'border-box',
  background:  'var(--vg-bg-surface)',
  border:      '1px solid var(--vg-border)',
  padding:     '0.8rem 1rem',
  fontFamily:  'var(--font-dm-sans)',
  fontSize:    VG.font.body,
  color:       'var(--vg-text)',
  outline:     'none',
  transition:  'border-color 0.2s ease, box-shadow 0.2s ease',
};

export const inputFocus: React.CSSProperties = {
  borderColor: 'var(--vg-gold-border)',
  boxShadow:   '0 0 0 3px rgba(212,168,83,0.08)',
};

export const inputBlur: React.CSSProperties = {
  borderColor: 'var(--vg-border)',
  boxShadow:   'none',
};

export type VGTokens = typeof VG;
