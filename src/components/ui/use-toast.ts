// src/components/ui/use-toast.ts
import { toast as sonnerToast } from 'sonner';

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
};

export function useToast() {
  const toast = ({ title, description, variant = 'default', duration = 4000 }: ToastOptions) => {
    const message = description || title || '';
    
    switch (variant) {
      case 'destructive':
        return sonnerToast.error(title, {
          description,
          duration,
        });
      case 'success':
        return sonnerToast.success(title, {
          description,
          duration,
        });
      default:
        return sonnerToast(title, {
          description,
          duration,
        });
    }
  };

  return { toast };
}
