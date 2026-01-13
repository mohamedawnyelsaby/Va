'use client';

import { I18nextProvider } from 'react-i18next';
import i18next from 'i18next';
import { useEffect } from 'react';

// Initialize i18n with basic config
if (!i18next.isInitialized) {
  i18next.init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: {
        common: {
          welcome: 'Welcome'
        }
      },
      ar: {
        common: {
          welcome: 'مرحبا'
        }
      }
    }
  });
}

export function I18nProvider({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  useEffect(() => {
    i18next.changeLanguage(locale);
  }, [locale]);

  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
}
