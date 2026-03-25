# VA Travel - High-Tech Gradient Design Guide
## Complete Design System Documentation

---

## Color System

### Primary Palette
| Color | Hex | Usage | RGB |
|-------|-----|-------|-----|
| Blue | #3B82F6 | Primary CTAs, Gradients | rgb(59, 130, 246) |
| Purple | #7C5CFC | Accents, Secondary Gradients | rgb(124, 92, 252) |
| Cyan | #06B6D4 | Highlights, Interactive Elements | rgb(6, 182, 212) |
| Pink | #EC4899 | Alerts, Special Features | rgb(236, 72, 153) |
| Orange | #F59E0B | Warnings, Important Info | rgb(245, 158, 11) |
| Green | #10B981 | Success, Confirmation | rgb(16, 185, 129) |

### Backgrounds
| Element | Color | Usage |
|---------|-------|-------|
| Primary Background | #0A0E27 | Page background |
| Card Background | #151B3D | Cards, Modals |
| Surface Background | #1A2249 | Hover states, Secondary areas |
| Deep Background | #232F5F | Form inputs, Borders |

### Text Colors
| Level | Color | Hex | Usage |
|-------|-------|-----|-------|
| Primary | #F0F4FF | Main text, Headings |
| Secondary | #A0A7C7 | Subtext, Descriptions |
| Tertiary | #707A95 | Disabled, Hints |
| Muted | rgba(255,255,255,0.5) | Placeholders |

---

## Typography

### Font Family
- **Heading**: Inter (Bold, Semibold)
- **Body**: Inter (Regular, Medium)
- **Code**: JetBrains Mono

### Font Sizes & Scale
```
h1: 3.5rem (56px) - Page titles
h2: 2.25rem (36px) - Section headings
h3: 1.875rem (30px) - Subsections
h4: 1.5rem (24px) - Card titles
Body: 1rem (16px) - Default text
Small: 0.875rem (14px) - UI text, labels
Tiny: 0.75rem (12px) - Captions, hints
```

### Line Heights
- Headings: 1.2
- Body: 1.6
- Small: 1.4

---

## Components

### Buttons
**Primary Button**
```tsx
<button className="bg-gradient-to-r from-[#3B82F6] to-[#7C5CFC] hover:from-[#60A5FA] hover:to-[#A78BFA] text-white px-8 py-4 rounded-lg font-semibold shadow-lg shadow-[#3B82F6]/30 transition-all">
  Click me
</button>
```

**Ghost Button**
```tsx
<button className="bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-white hover:bg-[#3B82F6]/25 px-8 py-4 rounded-lg transition-all">
  Click me
</button>
```

### Cards
**Premium Card**
```tsx
<div className="glass-effect rounded-2xl border border-[#3B82F6]/20 hover:border-[#7C5CFC]/50 p-6 transition-all">
  {/* Content */}
</div>
```

### Badges
**Active Badge**
```tsx
<span className="px-3 py-1 rounded-full bg-[#10B981]/20 text-[#10B981] text-xs font-semibold border border-[#10B981]/30">
  Active
</span>
```

### Form Elements
**Input Field**
```tsx
<input
  className="bg-[#151B3D] border border-[#3B82F6]/30 rounded-lg px-4 py-3 text-white placeholder:text-[#707A95] focus:outline-none focus:border-[#3B82F6]/60 transition-colors"
  placeholder="Enter text..."
/>
```

---

## Animations

### Framer Motion Variants

**Container Stagger Animation**
```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};
```

**Hover Scale Animation**
```typescript
<motion.div
  whileHover={{ scale: 1.05, y: -10 }}
  className="..."
>
```

**Gradient Shift Animation**
```css
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

### CSS Animations Available
- `glow-pulse` - Pulsing glow effect
- `float-up` - Fade in with upward movement
- `gradient-border` - Animated gradient border
- `shimmer` - Shimmer loading effect

---

## Layout Patterns

### Bento Grid Layout
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Cards */}
</div>
```

### Container Pattern
```tsx
<div className="container mx-auto px-4">
  {/* Content with max-width constraint */}
</div>
```

### Flexbox Utilities
- `flex items-center justify-between` - Horizontal spacing
- `flex flex-col gap-4` - Vertical stacking with gap
- `flex items-stretch` - Full height children

---

## Utility Classes

### Gradient Classes
```css
.gradient-text /* Gradient text color */
.gradient-bg /* Gradient background */
.gradient-border /* Animated gradient border */
.glow-effect /* Glowing shadow effect */
.glass-effect /* Frosted glass appearance */
.float-in /* Fade in animation */
```

### Color Variables
```css
--vt-bg /* Primary background */
--vt-bg-card /* Card background */
--vt-brand-purple /* Primary purple */
--vt-brand-blue /* Primary blue */
--vt-brand-cyan /* Accent cyan */
--vt-text /* Primary text */
--vt-text-2 /* Secondary text */
--vt-text-3 /* Tertiary text */
--vt-border /* Border color */
```

---

## Responsive Design Breakpoints

| Screen | Width | Class |
|--------|-------|-------|
| Mobile | < 640px | Default |
| Small | 640px+ | `sm:` |
| Medium | 768px+ | `md:` |
| Large | 1024px+ | `lg:` |
| XL | 1280px+ | `xl:` |
| 2XL | 1536px+ | `2xl:` |

### Mobile-First Example
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

---

## Spacing Scale

| Value | Pixel | Usage |
|-------|-------|-------|
| `p-2` | 8px | Small spacing |
| `p-4` | 16px | Standard spacing |
| `p-6` | 24px | Section padding |
| `p-8` | 32px | Large padding |
| `gap-4` | 16px | Gap between items |
| `gap-6` | 24px | Large gap |

---

## Shadows & Effects

### Glass Effect
```css
background: rgba(15, 23, 42, 0.5);
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.1);
```

### Glow Effect
```css
box-shadow: 0 0 20px rgba(123, 92, 252, 0.3), 
            0 0 40px rgba(59, 130, 246, 0.1);
```

### Soft Shadow
```css
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1),
            0 2px 4px rgba(0, 0, 0, 0.06);
```

---

## Best Practices

### DO ✓
- Use design tokens from globals.css
- Combine Tailwind with Framer Motion
- Keep animations under 0.6s
- Use semantic HTML
- Test on mobile devices
- Follow accessibility guidelines

### DON'T ✗
- Mix hardcoded colors with tokens
- Create complex nested animations
- Use transition: all
- Forget alt text on images
- Ignore screen reader support
- Create animations over 1s without purpose

---

## Example Component

```tsx
'use client';

import { motion } from 'framer-motion';

export function ExampleCard() {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.05, y: -10 }}
      className="glass-effect rounded-2xl border border-[#3B82F6]/20 p-6 hover:border-[#7C5CFC]/50 transition-all"
    >
      <h3 className="text-xl font-bold text-white mb-2">Title</h3>
      <p className="text-[#A0A7C7] mb-4">Description</p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-r from-[#3B82F6] to-[#7C5CFC] text-white px-4 py-2 rounded-lg"
      >
        Action
      </motion.button>
    </motion.div>
  );
}
```

---

## Resources

- **Framer Motion**: https://www.framer.com/motion/
- **Tailwind CSS**: https://tailwindcss.com/
- **Next.js**: https://nextjs.org/
- **Color Inspiration**: https://coolors.co/
- **Accessibility**: https://www.w3.org/WAI/

---

**Design System Version**: 2.0.0 - High-Tech Gradient Bold
**Last Updated**: 2026-03-25
