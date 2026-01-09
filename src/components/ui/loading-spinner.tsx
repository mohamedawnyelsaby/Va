// src/components/ui/loading-spinner.tsx

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

export function LoadingSpinner({ 
  size = 'md', 
  className,
  fullScreen = false 
}: LoadingSpinnerProps) {
  const spinner = (
    <Loader2 
      className={cn(
        'animate-spin text-primary',
        sizeClasses[size],
        className
      )} 
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner size="md" />
    </div>
  );
}
