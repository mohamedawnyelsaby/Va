// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

const sonner = vi.hoisted(() => {
  const fn = Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() });
  return fn;
});
vi.mock('sonner', () => ({ toast: sonner }));

import { useToast } from '@/components/ui/use-toast';

describe('useToast', () => {
  it('returns the SAME toast function on every call (stable dependency)', () => {
    // Regression: a new function per render made the hotel page re-fetch
    // /api/hotels/:id in an endless loop because it listed `toast` in deps.
    expect(useToast().toast).toBe(useToast().toast);
  });

  it('routes variants to the matching sonner call', () => {
    const { toast } = useToast();
    toast({ title: 'a', variant: 'destructive' });
    toast({ title: 'b', variant: 'success' });
    toast({ title: 'c' });
    expect(sonner.error).toHaveBeenCalledWith('a', expect.objectContaining({ duration: 4000 }));
    expect(sonner.success).toHaveBeenCalledWith('b', expect.anything());
    expect(sonner).toHaveBeenCalledWith('c', expect.anything());
  });
});
