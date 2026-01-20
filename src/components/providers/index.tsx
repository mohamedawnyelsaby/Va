// src/components/providers/index.tsx
'use client';
import { ThemeProvider } from './theme-provider';
import { QueryProvider } from './query-provider';
import { I18nProvider } from './i18n-provider';
import { PiProvider } from './pi-provider'; // ✅
import ToastProvider from './toast-provider';
import ModalProvider from './modal-provider';
import { TooltipProvider } from './tooltip-provider';
import { SessionProvider } from 'next-auth/react'; // ✅

interface ProvidersProps {
  children: React.ReactNode;
  locale?: string;
  session?: any; // ✅
}

export function Providers({ children, locale = 'en', session }: ProvidersProps) {
  return (
    <SessionProvider session={session}> {/* ✅ */}
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <QueryProvider>
          <I18nProvider locale={locale}>
            <PiProvider> {/* ✅ */}
              <TooltipProvider>
                {children}
                <ModalProvider />
                <ToastProvider />
              </TooltipProvider>
            </PiProvider>
          </I18nProvider>
        </QueryProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
