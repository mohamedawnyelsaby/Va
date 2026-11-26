'use client';
// PATH: src/components/ui/CounterRow.tsx
// One row of a +/- counter (label on the start side, [-] value [+] on the end side).
// Big tap targets, never goes outside [min, max], announces changes to screen readers.

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}

const BTN: React.CSSProperties = {
  width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
  border: '1px solid var(--bd)', background: 'var(--s1)', color: 'var(--g)', fontSize: '1.2rem', lineHeight: 1,
  fontFamily: 'inherit', padding: 0,
};

export default function CounterRow({ label, value, min, max, onChange }: Props) {
  const atMin = value <= min;
  const atMax = value >= max;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '8px 0' }}>
      <span style={{ fontSize: '.88rem', color: 'var(--t)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button type="button" aria-label={`− ${label}`} disabled={atMin} onClick={() => onChange(value - 1)}
          style={{ ...BTN, opacity: atMin ? 0.35 : 1, cursor: atMin ? 'not-allowed' : 'pointer' }}>−</button>
        <span aria-live="polite" style={{ minWidth: '1.6rem', textAlign: 'center', fontWeight: 700, color: 'var(--t)' }}>{value}</span>
        <button type="button" aria-label={`+ ${label}`} disabled={atMax} onClick={() => onChange(value + 1)}
          style={{ ...BTN, opacity: atMax ? 0.35 : 1, cursor: atMax ? 'not-allowed' : 'pointer' }}>+</button>
      </div>
    </div>
  );
}
