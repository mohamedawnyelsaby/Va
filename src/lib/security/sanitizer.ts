// ✅ Enterprise sanitizer — no external deps needed
import DOMPurify from 'isomorphic-dompurify';

// ============ XSS Protection ============

export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: { a: ['href', 'title', 'target'] },
  });
}

export function stripHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

export function escapeHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';
  const map: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#x27;', '/': '&#x2F;',
  };
  return input.replace(/[&<>"'/]/g, (c) => map[c]);
}

// ============ Email & URL ============

export function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== 'string') return null;
  const normalized = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(normalized) ? normalized : null;
}

export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    return url;
  } catch {
    return null;
  }
}

// ============ String ============

export function normalizeWhitespace(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input.trim().replace(/\s+/g, ' ');
}

export function sanitizeUsername(username: string): string | null {
  if (!username || typeof username !== 'string') return null;
  const sanitized = username.trim().toLowerCase();
  return /^[a-z0-9_]{3,20}$/.test(sanitized) ? sanitized : null;
}

export function removeSpecialChars(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input.replace(/[^a-zA-Z0-9\s]/g, '');
}

// ============ Numbers ============

export function sanitizeInt(input: any, opts?: { min?: number; max?: number; defaultValue?: number }): number | null {
  const num = parseInt(input, 10);
  if (isNaN(num)) return opts?.defaultValue ?? null;
  if (opts?.min !== undefined && num < opts.min) return opts.min;
  if (opts?.max !== undefined && num > opts.max) return opts.max;
  return num;
}

export function sanitizeFloat(input: any, opts?: { min?: number; max?: number; precision?: number }): number | null {
  const num = parseFloat(input);
  if (isNaN(num)) return null;
  let result = num;
  if (opts?.min !== undefined && result < opts.min) result = opts.min;
  if (opts?.max !== undefined && result > opts.max) result = opts.max;
  if (opts?.precision !== undefined) result = parseFloat(result.toFixed(opts.precision));
  return result;
}

export function sanitizeAmount(input: any): number | null {
  return sanitizeFloat(input, { min: 0, precision: 2 });
}

// ============ Security Detection ============

export function detectSQLInjection(input: string): boolean {
  const patterns = [
    /(\bUNION\b.*\bSELECT\b)/i, /(\bDROP\b.*\b(TABLE|DATABASE)\b)/i,
    /(\bDELETE\b.*\bFROM\b)/i, /(--|\#|\/\*)/,
    /('.*OR.*'=')/i, /(;.*DROP)/i,
  ];
  return patterns.some((p) => p.test(input));
}

export function detectXSS(input: string): boolean {
  const patterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi, /on\w+\s*=/gi, /<iframe/gi, /eval\s*\(/gi,
  ];
  return patterns.some((p) => p.test(input));
}

export function isSuspicious(input: string): boolean {
  return detectSQLInjection(input) || detectXSS(input) || input.includes('%00') || input.length > 10000;
}

// ============ File ============

export function sanitizeFilePath(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input.replace(/\.\./g, '').replace(/[\/\\]/g, '').replace(/[\x00-\x1f\x7f]/g, '');
}

export function isValidFileExtension(filename: string, allowed: string[]): boolean {
  const ext = filename.toLowerCase().split('.').pop();
  return ext ? allowed.includes(ext) : false;
}

// ============ Object ============

export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  schema: Record<keyof T, (v: any) => any>
): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, fn] of Object.entries(schema) as [keyof T, (v: any) => any][]) {
    if (key in obj) {
      try {
        const val = fn(obj[key]);
        if (val !== null && val !== undefined) result[key] = val;
      } catch {}
    }
  }
  return result;
}

export function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
}

export default {
  sanitizeHtml, stripHtml, escapeHtml,
  sanitizeEmail, sanitizeUrl,
  normalizeWhitespace, sanitizeUsername, removeSpecialChars,
  sanitizeInt, sanitizeFloat, sanitizeAmount,
  detectSQLInjection, detectXSS, isSuspicious,
  sanitizeFilePath, isValidFileExtension,
  sanitizeObject, isValidUUID,
};
