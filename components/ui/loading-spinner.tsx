import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

const sizes = { sm: 20, md: 32, lg: 44, xl: 56 };

export function LoadingSpinner({ size = 'md', className, label }: LoadingSpinnerProps) {
  const s = sizes[size];
  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div style={{
        width: s, height: s,
        border: '1px solid var(--vg-gold-border)',
        borderTop: '1px solid var(--vg-gold)',
        borderRadius: '50%',
        animation: 'vg-spin 0.9s linear infinite',
      }} />
      {label && (
        <span style={{
          fontFamily: 'var(--font-space-mono)',
          fontSize: '0.44rem', letterSpacing: '0.28em',
          textTransform: 'uppercase', color: 'var(--vg-text-3)',
        }}>
          {label}
        </span>
      )}
      <style>{`@keyframes vg-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
