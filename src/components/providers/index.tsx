
'use client';
import { ThemeProvider } from './theme-provider';
import { QueryProvider } from './query-provider';
import { I18nProvider } from './i18n-provider';
import { PiProvider } from './pi-provider';
import ToastProvider from './toast-provider';
import ModalProvider from './modal-provider';
import { TooltipProvider } from './tooltip-provider';

interface ProvidersProps {
  children: React.ReactNode;
  locale?: string;
}

export function Providers({ children, locale = 'en' }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <I18nProvider locale={locale}>
          <PiProvider>
            <TooltipProvider>
              {children}
              <ModalProvider />
              <ToastProvider />
            </TooltipProvider>
          </PiProvider>
        </I18nProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
