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

export function formatNumber(
  number: number,
  locale: string = 'en',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(number);
}

export function formatDate(
  date: Date | string,
  locale: string = 'en',
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
}

export function formatShortDate(
  date: Date | string,
  locale: string = 'en'
): string {
  return formatDate(date, locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(
  date: Date | string,
  locale: string = 'en'
): string {
  return formatDate(date, locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(
  date: Date | string,
  locale: string = 'en'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return rtf.format(-diffInMinutes, 'minute');
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return rtf.format(-diffInHours, 'hour');
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return rtf.format(-diffInDays, 'day');
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return rtf.format(-diffInMonths, 'month');
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return rtf.format(-diffInYears, 'year');
}

export function formatPercent(
  value: number,
  locale: string = 'en',
  decimals: number = 0
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

export function formatDuration(
  startDate: Date | string,
  endDate: Date | string,
  locale: string = 'en'
): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  const diffInDays = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (diffInDays === 1) {
    return locale === 'ar' ? 'ليلة واحدة' : '1 night';
  }

  return locale === 'ar'
    ? `${diffInDays} ${diffInDays <= 10 ? 'ليالٍ' : 'ليلة'}`
    : `${diffInDays} nights`;
}

export function formatList(
  items: string[],
  locale: string = 'en',
  type: 'conjunction' | 'disjunction' = 'conjunction'
): string {
  const listFormatter = new Intl.ListFormat(locale, {
    style: 'long',
    type,
  });

  return listFormatter.format(items);
}

export function getTextDirection(locale: string): 'ltr' | 'rtl' {
  const rtlLocales = ['ar', 'he', 'fa', 'ur'];
  return rtlLocales.includes(locale) ? 'rtl' : 'ltr';
}

export function formatCompactNumber(
  number: number,
  locale: string = 'en'
): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(number);
}
