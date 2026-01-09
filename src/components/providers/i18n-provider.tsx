'use client';

import i18n from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { ReactNode, useEffect, useState } from 'react';

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`@/public/locales/${language}/${namespace}.json`)
    )
  )
  .init({
    supportedLngs: ['en', 'ar', 'fr', 'es', 'de', 'zh', 'ja', 'ru', 'pt', 'hi'],
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'home', 'hotels', 'attractions', 'restaurants', 'booking', 'profile'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['cookie', 'htmlTag', 'localStorage', 'path', 'subdomain'],
      caches: ['cookie'],
    },
    react: {
      useSuspense: true,
    },
  });

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await i18n.init();
      setInitialized(true);
    };
    initialize();
  }, []);

  if (!initialized) {
    return null;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
