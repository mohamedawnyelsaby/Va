// PATH: src/lib/tokens.ts
// ═══════════════════════════════════════════════════════════════
// Va Travel — Unified Design Token System v2.0
// All sizes reference CSS variables where possible.
// ═══════════════════════════════════════════════════════════════

export const VG = {

  // ── Typography ──────────────────────────────────────────────
  // Minimum readable: 9.9px (0.62rem at 16px base)
  font: {
    micro:   '0.62rem',   //  9.9px — labels, badges, overlines
    tiny:    '0.70rem',   // 11.2px — sub-labels, timestamps
    small:   '0.80rem',   // 12.8px — secondary text, descriptions
    body:    '0.875rem',  // 14.0px — main body copy (DM Sans)
    bodyLg:  '0.95rem',   // 15.2px — emphasized body
    button:  '0.60rem',   //  9.6px — Space Mono buttons
    nav:     '0.60rem',   //  9.6px — navigation links
  },

  // ── Letter Spacing ──────────────────────────────────────────
  tracking: {
    wide:    '0.32em',  // section labels, overlines
    normal:  '0.22em',  // buttons, nav items
    tight:   '0.12em',  // inline badges, small labels
    xwide:   '0.40em',  // hero tags, special callouts
  },

  // ── Section Spacing ─────────────────────────────────────────
  section: {
    x:   'clamp(1.5rem, 7vw, 5rem)',
    y:   'clamp(3rem, 6vw, 5rem)',
    yLg: 'clamp(5rem, 9vw, 8rem)',
  },

  // ── Transitions ─────────────────────────────────────────────
  transition: {
    fast:   'all 0.15s ease',
    normal: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
    slow:   'all 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
    color:  'color 0.2s ease, border-color 0.2s ease, background 0.2s ease',
  },

  // ── Z-index Scale ───────────────────────────────────────────
  z: {
    base:    1,
    card:    2,
    overlay: 3,
    nav:     500,
    modal:   600,
    cursor:  9997,
    grain:   9999,
  },

} as const;

// ──────────────────────────────────────────────────────────────
// Reusable inline style objects
// ──────────────────────────────────────────────────────────────

/** Space Mono label — muted, uppercase, tight tracking */
export const monoLabel: React.CSSProperties = {
  fontFamily:    'var(--font-space-mono)',
  fontSize:      VG.font.micro,
  letterSpacing: VG.tracking.tight,
  textTransform: 'uppercase',
  color:         'var(--vg-text-3)',
};

/** Gold variant of monoLabel */
export const monoLabelGold: React.CSSProperties = {
  ...monoLabel,
  color:         'var(--vg-gold)',
  letterSpacing: VG.tracking.normal,
};

/** Section overline style */
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

/** Standard card base styles */
export const cardBase: React.CSSProperties = {
  background: 'var(--vg-bg-card)',
  border:     '1px solid var(--vg-border)',
  boxShadow:  'var(--vg-shadow-card)',
};

/** Large stat/number display */
export const statNum: React.CSSProperties = {
  fontFamily:    'var(--font-cormorant)',
  fontWeight:    300,
  color:         'var(--vg-gold)',
  lineHeight:    0.92,
  letterSpacing: '-0.02em',
};

/** Standard text input base */
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

/** Focus state for inputBase */
export const inputFocus: React.CSSProperties = {
  borderColor: 'var(--vg-gold-border)',
  boxShadow:   '0 0 0 3px rgba(212,168,83,0.08)',
};

/** Blur/default state for inputBase */
export const inputBlur: React.CSSProperties = {
  borderColor: 'var(--vg-border)',
  boxShadow:   'none',
};

export type VGTokens = typeof VG;
