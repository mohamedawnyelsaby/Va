import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(
  date: Date | string,
  locale: string = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

export function formatNumber(
  number: number,
  locale: string = 'en-US',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(number);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function isObjectEmpty(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function mergeObjects<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  return { ...target, ...source };
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function camelToKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, g => g[1].toUpperCase());
}

export function getQueryParam(url: string, param: string): string | null {
  const urlObj = new URL(url, window.location.origin);
  return urlObj.searchParams.get(param);
}

export function setQueryParam(
  url: string,
  param: string,
  value: string
): string {
  const urlObj = new URL(url, window.location.origin);
  urlObj.searchParams.set(param, value);
  return urlObj.toString();
}

export function removeQueryParam(url: string, param: string): string {
  const urlObj = new URL(url, window.location.origin);
  urlObj.searchParams.delete(param);
  return urlObj.toString();
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSeconds > 0 || parts.length === 0) {
    parts.push(`${remainingSeconds}s`);
  }

  return parts.join(' ');
}

export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function flattenArray<T>(arrays: T[][]): T[] {
  return arrays.reduce((flat, array) => flat.concat(array), []);
}

export function uniqueArray<T>(array: T[]): T[] {
  return [...new Set(array)];
}

export function sortByProperty<T>(
  array: T[],
  property: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aValue = a[property];
    const bValue = b[property];

    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

export function groupBy<T>(
  array: T[],
  key: keyof T
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

export function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function isServer(): boolean {
  return typeof window === 'undefined';
}

export function getOS(): string {
  if (!isClient()) return '';

  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;
  const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
  const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
  const iosPlatforms = ['iPhone', 'iPad', 'iPod'];

  if (macosPlatforms.indexOf(platform) !== -1) {
    return 'macOS';
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    return 'iOS';
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    return 'Windows';
  } else if (/Android/.test(userAgent)) {
    return 'Android';
  } else if (/Linux/.test(platform)) {
    return 'Linux';
  }

  return 'Unknown';
}

export function getBrowser(): string {
  if (!isClient()) return '';

  const userAgent = window.navigator.userAgent;
  let browserName = 'Unknown';

  if (userAgent.includes('Firefox')) {
    browserName = 'Firefox';
  } else if (userAgent.includes('SamsungBrowser')) {
    browserName = 'Samsung Browser';
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    browserName = 'Opera';
  } else if (userAgent.includes('Trident')) {
    browserName = 'Internet Explorer';
  } else if (userAgent.includes('Edge')) {
    browserName = 'Edge';
  } else if (userAgent.includes('Chrome')) {
    browserName = 'Chrome';
  } else if (userAgent.includes('Safari')) {
    browserName = 'Safari';
  }

  return browserName;
}

export function copyToClipboard(text: string): Promise<void> {
  if (!isClient()) return Promise.reject(new Error('Not in browser'));

  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    return new Promise((resolve, reject) => {
      try {
        document.execCommand('copy');
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        textArea.remove();
      }
    });
  }
}

export function readFromClipboard(): Promise<string> {
  if (!isClient()) return Promise.reject(new Error('Not in browser'));

  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.readText();
  } else {
    return Promise.reject(new Error('Clipboard API not available'));
  }
}
