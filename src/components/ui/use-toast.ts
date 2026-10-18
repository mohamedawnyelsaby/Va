// src/components/ui/use-toast.ts
import { toast as sonnerToast } from 'sonner';

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
};

// Module-level so the SAME function is returned on every render. It used to be
// created inside the hook, i.e. a new identity per render; pages that list it
// in a useCallback/useEffect dependency array (the hotel detail page does)
// then re-ran their effect after every render -- an endless fetch loop against
// /api/hotels/:id (~2 requests/second per open tab).
const toast = ({ title, description, variant = 'default', duration = 4000 }: ToastOptions) => {
  switch (variant) {
    case 'destructive':
      return sonnerToast.error(title, { description, duration });
    case 'success':
      return sonnerToast.success(title, { description, duration });
    default:
      return sonnerToast(title, { description, duration });
  }
};

export function useToast() {
  return { toast };
}
