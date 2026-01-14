'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
<<<<<<< HEAD
import type { ThemeProviderProps } from 'next-themes';
=======
import { type ThemeProviderProps } from 'next-themes';
>>>>>>> fec9968 (fix: theme-provider import path)

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
