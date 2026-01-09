// src/lib/i18n/server.ts
// Server-side internationalization utilities

type Locale = 'en' | 'ar' | 'fr' | 'es' | 'de' | 'zh' | 'ja' | 'ru' | 'pt' | 'hi';

const defaultLocale: Locale = 'en';

// Translation keys type
type TranslationKeys = {
  [key: string]: string | TranslationKeys;
};

// Simple translation getter for server components
export async function getTranslations(locale: string, namespace: string = 'common') {
  try {
    const translations = await import(`../../../public/locales/${locale}/${namespace}.json`);
    
    return (key: string): string => {
      const keys = key.split('.');
      let value: any = translations.default;
      
      for (const k of keys) {
        value = value?.[k];
      }
      
      return typeof value === 'string' ? value : key;
    };
  } catch (error) {
    console.error(`Failed to load translations for ${locale}/${namespace}:`, error);
    
    // Return fallback function
    return (key: string): string => key;
  }
}

// Get locale from headers or default
export function getLocale(headers?: Headers): Locale {
  if (!headers) return defaultLocale;
  
  const acceptLanguage = headers.get('accept-language');
  if (!acceptLanguage) return defaultLocale;
  
  const preferredLocale = acceptLanguage.split(',')[0].split('-')[0];
  
  const supportedLocales: Locale[] = ['en', 'ar', 'fr', 'es', 'de', 'zh', 'ja', 'ru', 'pt', 'hi'];
  
  return supportedLocales.includes(preferredLocale as Locale) 
    ? (preferredLocale as Locale) 
    : defaultLocale;
}

// Check if locale is RTL
export function isRTL(locale: string): boolean {
  const rtlLocales = ['ar', 'he', 'fa', 'ur'];
  return rtlLocales.includes(locale);
}

// Format date based on locale
export function formatDate(date: Date, locale: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}

// Format currency based on locale
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format number based on locale
export function formatNumber(
  number: number,
  locale: string = 'en',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(number);
}
