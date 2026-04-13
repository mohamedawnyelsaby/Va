// PATH: src/lib/tokens.ts
// ═══════════════════════════════════════════════════════
// Va Travel — Design Token System
// مصدر واحد لكل القيم التصميمية في المشروع
// استخدم هذه المتغيرات بدلاً من القيم المضمّنة مباشرة
// ═══════════════════════════════════════════════════════

export const VG = {

  // ── Typography ──────────────────────────────────────
  // Space Mono (monospace) — للـ labels والـ badges والـ overlines
  // لا تستخدم أي قيمة أقل من font.micro في أي مكان
  font: {
    micro:   '0.65rem',   // 10.4px — أصغر خط مسموح — labels فقط
    tiny:    '0.72rem',   // 11.5px — sub-labels, badges
    small:   '0.78rem',   // 12.5px — secondary text
    body:    '0.88rem',   // 14px   — النص الرئيسي DM Sans
    bodyLg:  '0.95rem',   // 15.2px — نص أكبر قليلاً
    button:  '0.68rem',   // 10.9px — أزرار Space Mono
    nav:     '0.70rem',   // 11.2px — nav links
  },

  // ── Letter Spacing (للـ Space Mono فقط) ─────────────
  tracking: {
    wide:   '0.28em',   // overlines, titles
    normal: '0.18em',   // nav, buttons
    tight:  '0.12em',   // badges, labels inline
  },

  // ── Spacing ──────────────────────────────────────────
  space: {
    '1':  '0.25rem',   // 4px
    '2':  '0.5rem',    // 8px
    '3':  '0.75rem',   // 12px
    '4':  '1rem',      // 16px
    '5':  '1.25rem',   // 20px
    '6':  '1.5rem',    // 24px
    '8':  '2rem',      // 32px
    '10': '2.5rem',    // 40px
    '12': '3rem',      // 48px
    '16': '4rem',      // 64px
    '20': '5rem',      // 80px
  },

  // ── Section Padding (responsive) ────────────────────
  section: {
    x: 'clamp(1.5rem, 7vw, 5rem)',
    y: 'clamp(3rem, 6vw, 5rem)',
    yLg: 'clamp(4rem, 8vw, 7rem)',
  },

  // ── Border Radius ────────────────────────────────────
  // Va Travel يستخدم sharp corners (radius=0) كـ design language
  // استخدام radius فقط للـ badges والـ pills الاختيارية
  radius: {
    none:  '0px',
    sm:    '2px',    // badges صغيرة
    md:    '4px',    // pills
  },

  // ── Transition ───────────────────────────────────────
  transition: {
    fast:   'all 0.15s ease',
    normal: 'all 0.25s ease',
    slow:   'all 0.4s ease',
    color:  'color 0.2s ease, border-color 0.2s ease, background 0.2s ease',
  },

  // ── Z-index ──────────────────────────────────────────
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

// ── Style Helpers ──────────────────────────────────────
// جاهزة للاستخدام كـ inline style objects

export const monoLabel = {
  fontFamily: 'var(--font-space-mono)',
  fontSize:   VG.font.micro,
  letterSpacing: VG.tracking.tight,
  textTransform: 'uppercase' as const,
  color:      'var(--vg-text-3)',
};

export const monoLabelGold = {
  ...monoLabel,
  color: 'var(--vg-gold)',
  letterSpacing: VG.tracking.wide,
};

export const overlineStyle = {
  fontFamily:    'var(--font-space-mono)',
  fontSize:      VG.font.micro,
  letterSpacing: VG.tracking.wide,
  textTransform: 'uppercase' as const,
  color:         'var(--vg-gold)',
  display:       'flex',
  alignItems:    'center',
  gap:           '0.75rem',
};

export const cardBase = {
  background:  'var(--vg-bg-card)',
  border:      '1px solid var(--vg-border)',
  transition:  VG.transition.color,
};

export const statNum = {
  fontFamily: 'var(--font-cormorant)',
  fontWeight: 300,
  fontSize:   'clamp(2rem, 4vw, 3.5rem)',
  color:      'var(--vg-gold)',
  lineHeight: 1,
};

// ── Input Base Style ───────────────────────────────────
export const inputBase = {
  width:       '100%',
  boxSizing:   'border-box' as const,
  background:  'var(--vg-bg-surface)',
  border:      '1px solid var(--vg-border)',
  padding:     '0.75rem 0.9rem',
  fontFamily:  'var(--font-dm-sans)',
  fontSize:    VG.font.body,
  color:       'var(--vg-text)',
  outline:     'none',
  transition:  VG.transition.color,
};

export const inputFocus = { borderColor: 'var(--vg-gold-border)' };
export const inputBlur  = { borderColor: 'var(--vg-border)' };

export type VGTokens = typeof VG;
