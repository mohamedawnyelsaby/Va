// ============================================
// INPUT SANITIZATION & VALIDATION
// Enterprise-Grade Security Layer
// ============================================
// Path: lib/security/sanitizer.ts
// ============================================

import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

// ============================================
// XSS PROTECTION
// ============================================

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string, options?: {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
}): string {
  if (!dirty || typeof dirty !== 'string') return '';
  
  const config = {
    ALLOWED_TAGS: options?.allowedTags || ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: options?.allowedAttributes || { a: ['href', 'title'] },
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  };
  
  return DOMPurify.sanitize(dirty, config);
}

/**
 * Strip all HTML tags
 */
export function stripHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return input.replace(/[&<>"'/]/g, (char) => escapeMap[char]);
}

/**
 * Unescape HTML entities
 */
export function unescapeHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  const unescapeMap: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/',
  };
  
  return input.replace(/&(amp|lt|gt|quot|#x27|#x2F);/g, (match) => unescapeMap[match]);
}

// ============================================
// SQL INJECTION PROTECTION
// ============================================

/**
 * Escape SQL special characters
 * Note: Use parameterized queries instead when possible
 */
export function escapeSql(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x00/g, '\\0')
    .replace(/\x1a/g, '\\Z');
}

/**
 * Validate SQL identifier (table/column names)
 */
export function isValidSqlIdentifier(input: string): boolean {
  // Only allow alphanumeric and underscore
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(input);
}

/**
 * Sanitize table/column name
 */
export function sanitizeSqlIdentifier(input: string): string {
  if (!isValidSqlIdentifier(input)) {
    throw new Error(`Invalid SQL identifier: ${input}`);
  }
  return input;
}

// ============================================
// NOSQL INJECTION PROTECTION
// ============================================

/**
 * Sanitize MongoDB query to prevent NoSQL injection
 */
export function sanitizeMongoQuery(input: any): any {
  if (typeof input !== 'object' || input === null) {
    return input;
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeMongoQuery);
  }
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(input)) {
    // Remove dangerous operators
    if (key.startsWith('$')) {
      const allowedOperators = [
        '$eq', '$ne', '$gt', '$gte', '$lt', '$lte',
        '$in', '$nin', '$and', '$or', '$not',
        '$exists', '$type', '$regex'
      ];
      
      if (!allowedOperators.includes(key)) {
        console.warn(`⚠️ Blocked potentially dangerous operator: ${key}`);
        continue;
      }
    }
    
    sanitized[key] = sanitizeMongoQuery(value);
  }
  
  return sanitized;
}

// ============================================
// PATH TRAVERSAL PROTECTION
// ============================================

/**
 * Sanitize file path to prevent directory traversal
 */
export function sanitizeFilePath(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  // Remove any path traversal attempts
  return input
    .replace(/\.\./g, '')
    .replace(/[\/\\]/g, '')
    .replace(/[\x00-\x1f\x7f]/g, ''); // Remove control characters
}

/**
 * Validate file extension
 */
export function isValidFileExtension(filename: string, allowedExtensions: string[]): boolean {
  const ext = filename.toLowerCase().split('.').pop();
  return ext ? allowedExtensions.includes(ext) : false;
}

// ============================================
// EMAIL & URL VALIDATION
// ============================================

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== 'string') return null;
  
  const normalized = validator.normalizeEmail(email);
  
  if (!normalized || !validator.isEmail(normalized)) {
    return null;
  }
  
  return normalized;
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string, options?: {
  allowedProtocols?: string[];
  requireProtocol?: boolean;
}): string | null {
  if (!url || typeof url !== 'string') return null;
  
  const opts = {
    allowedProtocols: options?.allowedProtocols || ['http', 'https'],
    requireProtocol: options?.requireProtocol !== false,
  };
  
  // Check if URL is valid
  if (!validator.isURL(url, {
    protocols: opts.allowedProtocols,
    require_protocol: opts.requireProtocol,
  })) {
    return null;
  }
  
  try {
    const parsed = new URL(url);
    
    // Check protocol
    if (!opts.allowedProtocols.includes(parsed.protocol.replace(':', ''))) {
      return null;
    }
    
    return url;
  } catch {
    return null;
  }
}

// ============================================
// STRING SANITIZATION
// ============================================

/**
 * Remove all whitespace
 */
export function removeWhitespace(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input.replace(/\s+/g, '');
}

/**
 * Normalize whitespace
 */
export function normalizeWhitespace(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input.trim().replace(/\s+/g, ' ');
}

/**
 * Remove special characters (keep only alphanumeric and spaces)
 */
export function removeSpecialChars(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input.replace(/[^a-zA-Z0-9\s]/g, '');
}

/**
 * Sanitize username
 */
export function sanitizeUsername(username: string): string | null {
  if (!username || typeof username !== 'string') return null;
  
  const sanitized = username.trim().toLowerCase();
  
  // Username must be 3-20 characters, alphanumeric and underscore only
  if (!/^[a-z0-9_]{3,20}$/.test(sanitized)) {
    return null;
  }
  
  return sanitized;
}

/**
 * Sanitize phone number
 */
export function sanitizePhoneNumber(phone: string): string | null {
  if (!phone || typeof phone !== 'string') return null;
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Validate length (7-15 digits)
  if (cleaned.length < 7 || cleaned.length > 15) {
    return null;
  }
  
  return cleaned;
}

// ============================================
// NUMBER SANITIZATION
// ============================================

/**
 * Sanitize integer
 */
export function sanitizeInt(input: any, options?: {
  min?: number;
  max?: number;
  defaultValue?: number;
}): number | null {
  const num = parseInt(input, 10);
  
  if (isNaN(num)) {
    return options?.defaultValue ?? null;
  }
  
  if (options?.min !== undefined && num < options.min) {
    return options.min;
  }
  
  if (options?.max !== undefined && num > options.max) {
    return options.max;
  }
  
  return num;
}

/**
 * Sanitize float
 */
export function sanitizeFloat(input: any, options?: {
  min?: number;
  max?: number;
  precision?: number;
  defaultValue?: number;
}): number | null {
  const num = parseFloat(input);
  
  if (isNaN(num)) {
    return options?.defaultValue ?? null;
  }
  
  let result = num;
  
  if (options?.min !== undefined && result < options.min) {
    result = options.min;
  }
  
  if (options?.max !== undefined && result > options.max) {
    result = options.max;
  }
  
  if (options?.precision !== undefined) {
    result = parseFloat(result.toFixed(options.precision));
  }
  
  return result;
}

/**
 * Sanitize amount (for payments)
 */
export function sanitizeAmount(input: any): number | null {
  return sanitizeFloat(input, {
    min: 0,
    precision: 2,
  });
}

// ============================================
// OBJECT SANITIZATION
// ============================================

/**
 * Deep sanitize object
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  schema: Record<keyof T, (value: any) => any>
): Partial<T> {
  const sanitized: Partial<T> = {};
  
  for (const [key, sanitizer] of Object.entries(schema) as [keyof T, (value: any) => any][]) {
    if (key in obj) {
      try {
        const sanitizedValue = sanitizer(obj[key]);
        if (sanitizedValue !== null && sanitizedValue !== undefined) {
          sanitized[key] = sanitizedValue;
        }
      } catch (error) {
        console.error(`Sanitization error for key ${String(key)}:`, error);
      }
    }
  }
  
  return sanitized;
}

/**
 * Remove undefined and null values
 */
export function removeNullish<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: Partial<T> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      cleaned[key as keyof T] = value;
    }
  }
  
  return cleaned;
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate credit card number (Luhn algorithm)
 */
export function isValidCreditCard(cardNumber: string): boolean {
  return validator.isCreditCard(cardNumber);
}

/**
 * Validate date
 */
export function isValidDate(date: string): boolean {
  return validator.isDate(date);
}

/**
 * Validate UUID
 */
export function isValidUUID(uuid: string): boolean {
  return validator.isUUID(uuid);
}

/**
 * Validate JSON
 */
export function isValidJSON(json: string): boolean {
  return validator.isJSON(json);
}

/**
 * Validate base64
 */
export function isValidBase64(base64: string): boolean {
  return validator.isBase64(base64);
}

// ============================================
// MIDDLEWARE HELPER
// ============================================

/**
 * Sanitize request body
 */
export function sanitizeRequestBody<T extends Record<string, any>>(
  body: any,
  schema: Record<keyof T, (value: any) => any>
): Partial<T> {
  if (!body || typeof body !== 'object') {
    return {};
  }
  
  return sanitizeObject(body, schema);
}

// ============================================
// USAGE EXAMPLES
// ============================================

/*
==============================================
BASIC SANITIZATION
==============================================

import { 
  sanitizeHtml, 
  stripHtml, 
  escapeHtml,
  sanitizeEmail,
  sanitizeUrl,
} from '@/lib/security/sanitizer';

// HTML sanitization
const dirty = '<script>alert("xss")</script><p>Hello</p>';
const clean = sanitizeHtml(dirty); // Output: <p>Hello</p>

// Strip all HTML
const stripped = stripHtml(dirty); // Output: Hello

// Escape HTML
const escaped = escapeHtml('<div>Test</div>'); // Output: &lt;div&gt;Test&lt;/div&gt;

// Email validation
const email = sanitizeEmail('  TEST@EXAMPLE.COM  '); // Output: test@example.com

// URL validation
const url = sanitizeUrl('http://example.com'); // Output: http://example.com
const badUrl = sanitizeUrl('javascript:alert(1)'); // Output: null

==============================================
OBJECT SANITIZATION
==============================================

import { sanitizeObject, sanitizeInt, sanitizeFloat } from '@/lib/security/sanitizer';

const userInput = {
  name: '  John Doe  ',
  age: '25',
  email: 'JOHN@EXAMPLE.COM',
  amount: '99.99',
};

const sanitized = sanitizeObject(userInput, {
  name: (v) => v.trim(),
  age: (v) => sanitizeInt(v, { min: 0, max: 120 }),
  email: sanitizeEmail,
  amount: sanitizeAmount,
});

// Result: { name: 'John Doe', age: 25, email: 'john@example.com', amount: 99.99 }

==============================================
API ROUTE USAGE
==============================================

// app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sanitizeRequestBody, sanitizeInt, sanitizeFloat } from '@/lib/security/sanitizer';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Define schema
  const schema = {
    hotelId: (v: any) => v.toString(),
    checkIn: (v: any) => new Date(v).toISOString(),
    checkOut: (v: any) => new Date(v).toISOString(),
    guests: (v: any) => sanitizeInt(v, { min: 1, max: 10 }),
    totalAmount: sanitizeFloat,
  };
  
  // Sanitize input
  const sanitized = sanitizeRequestBody(body, schema);
  
  // Validate required fields
  if (!sanitized.hotelId || !sanitized.checkIn || !sanitized.checkOut) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }
  
  // Process booking with sanitized data
  return NextResponse.json({ success: true });
}

==============================================
SQL INJECTION PREVENTION
==============================================

import { escapeSql, sanitizeSqlIdentifier } from '@/lib/security/sanitizer';

// BAD - Never do this!
const query = `SELECT * FROM users WHERE name = '${userInput}'`;

// GOOD - Use parameterized queries (Prisma does this automatically)
const users = await prisma.user.findMany({
  where: { name: userInput },
});

// If you must build dynamic queries (not recommended)
const safeName = escapeSql(userInput);
const safeTable = sanitizeSqlIdentifier(tableName);

==============================================
NOSQL INJECTION PREVENTION
==============================================

import { sanitizeMongoQuery } from '@/lib/security/sanitizer';

// Unsafe user input
const userFilter = {
  username: 'admin',
  $where: 'this.password.length > 0', // DANGEROUS!
};

// Sanitized query
const safeFilter = sanitizeMongoQuery(userFilter);
// Result: { username: 'admin' } - $where is removed

==============================================
FILE UPLOAD SANITIZATION
==============================================

import { sanitizeFilePath, isValidFileExtension } from '@/lib/security/sanitizer';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  // Sanitize filename
  const safeFilename = sanitizeFilePath(file.name);
  
  // Validate extension
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
  if (!isValidFileExtension(safeFilename, allowedExtensions)) {
    return NextResponse.json(
      { error: 'Invalid file type' },
      { status: 400 }
    );
  }
  
  // Process file...
}

==============================================
*/

export default {
  // XSS Protection
  sanitizeHtml,
  stripHtml,
  escapeHtml,
  unescapeHtml,
  
  // SQL Injection Protection
  escapeSql,
  isValidSqlIdentifier,
  sanitizeSqlIdentifier,
  
  // NoSQL Injection Protection
  sanitizeMongoQuery,
  
  // Path Traversal Protection
  sanitizeFilePath,
  isValidFileExtension,
  
  // Email & URL
  sanitizeEmail,
  sanitizeUrl,
  
  // String Sanitization
  removeWhitespace,
  normalizeWhitespace,
  removeSpecialChars,
  sanitizeUsername,
  sanitizePhoneNumber,
  
  // Number Sanitization
  sanitizeInt,
  sanitizeFloat,
  sanitizeAmount,
  
  // Object Sanitization
  sanitizeObject,
  removeNullish,
  
  // Validation
  isValidCreditCard,
  isValidDate,
  isValidUUID,
  isValidJSON,
  isValidBase64,
  
  // Middleware
  sanitizeRequestBody,
};
