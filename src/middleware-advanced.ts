// src/middleware-advanced.ts
// 🛡️ ULTRA SECURE MIDDLEWARE - ENTERPRISE LEVEL

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { AttackPrevention } from './lib/security/attack-prevention';
import { AuditLogger } from './lib/security/audit-logger';

const locales = ['en', 'ar', 'fr', 'es', 'de', 'zh', 'ja', 'ru', 'pt', 'hi'];
const defaultLocale = 'en';

const protectedRoutes = ['/dashboard', '/bookings', '/profile', '/settings'];
const authRoutes = ['/auth/signin', '/auth/signup'];
const publicRoutes = ['/'];

// Rate limiting tiers
const RATE_LIMITS = {
  api: { max: 100, window: 60000 }, // 100 req/min
  auth: { max: 5, window: 300000 }, // 5 req/5min
  public: { max: 200, window: 60000 }, // 200 req/min
  authenticated: { max: 500, window: 60000 }, // 500 req/min
};

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const { pathname } = request.nextUrl;

  // Extract request info
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
  const userAgent = request.headers.get('user-agent') ?? 'unknown';
  const method = request.method;

  // ========================================
  // 1. IP BLOCKING CHECK
  // ========================================
  if (await AttackPrevention.isIPBlocked(ip)) {
    await AuditLogger.logSecurityEvent({
      action: 'blocked_ip_attempt',
      success: false,
      failureReason: 'IP is blocked',
      ipAddress: ip,
      userAgent,
    });

    return new NextResponse('Access Denied', {
      status: 403,
      headers: {
        'X-Blocked': 'true',
        'X-Block-Reason': 'Your IP has been blocked due to suspicious activity',
      },
    });
  }

  // ========================================
  // 2. BOT DETECTION
  // ========================================
  if (AttackPrevention.isBot(userAgent)) {
    // Allow search engine bots, block scrapers
    const allowedBots = ['googlebot', 'bingbot', 'slurp', 'duckduckbot'];
    const isAllowedBot = allowedBots.some((bot) =>
      userAgent.toLowerCase().includes(bot)
    );

    if (!isAllowedBot) {
      await AuditLogger.logSecurityEvent({
        action: 'bot_blocked',
        success: false,
        ipAddress: ip,
        userAgent,
      });

      return new NextResponse('Bot Detected', {
        status: 403,
        headers: {
          'X-Bot-Blocked': 'true',
        },
      });
    }
  }

  // ========================================
  // 3. RATE LIMITING
  // ========================================
  let rateLimit = RATE_LIMITS.public;

  if (pathname.startsWith('/api')) {
    rateLimit = RATE_LIMITS.api;
  } else if (pathname.includes('/auth/')) {
    rateLimit = RATE_LIMITS.auth;
  }

  const rateLimitCheck = await AttackPrevention.checkRateLimit(
    ip,
    rateLimit.max,
    rateLimit.window
  );

  if (!rateLimitCheck.allowed) {
    await AuditLogger.logSecurityEvent({
      action: 'rate_limit_exceeded',
      success: false,
      ipAddress: ip,
      userAgent,
      metadata: {
        limit: rateLimit.max,
        window: rateLimit.window,
      },
    });

    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '60',
        'X-RateLimit-Limit': rateLimit.max.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': rateLimitCheck.resetAt.toISOString(),
      },
    });
  }

  // ========================================
  // 4. SQL INJECTION / XSS DETECTION
  // ========================================
  const queryParams = new URL(request.url).searchParams;
  for (const [key, value] of queryParams.entries()) {
    if (AttackPrevention.isSuspicious(value)) {
      await AuditLogger.logSecurityEvent({
        action: AttackPrevention.detectSQLInjection(value)
          ? 'sql_injection_attempt'
          : 'xss_attempt',
        success: false,
        ipAddress: ip,
        userAgent,
        metadata: {
          param: key,
          value: value.substring(0, 100), // Log first 100 chars only
        },
      });

      // Block the IP for 1 hour
      await AttackPrevention.blockIP(
        ip,
        'Malicious request detected',
        60
      );

      return new NextResponse('Malicious Request Detected', {
        status: 400,
        headers: {
          'X-Security-Block': 'true',
        },
      });
    }
  }

  // ========================================
  // 5. LOCALE HANDLING
  // ========================================
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    const locale = getLocale(request) || defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }

  const locale = pathname.split('/')[1];

  // ========================================
  // 6. AUTHENTICATION CHECK
  // ========================================
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(`/${locale}${route}`)
  );

  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(`/${locale}${route}`)
  );

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !token) {
    const url = new URL(`/${locale}/auth/signin`, request.url);
    url.searchParams.set('callbackUrl', pathname);

    await AuditLogger.logSecurityEvent({
      action: 'unauthorized_access_attempt',
      success: false,
      failureReason: 'Not authenticated',
      ipAddress: ip,
      userAgent,
      metadata: { attemptedPath: pathname },
    });

    return NextResponse.redirect(url);
  }

  // Redirect to dashboard if accessing auth routes while authenticated
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // ========================================
  // 7. SESSION ANOMALY DETECTION
  // ========================================
  if (token?.sub) {
    const sessionId = token.sub;
    const anomalyDetected = await AttackPrevention.checkSessionAnomaly(
      sessionId,
      ip,
      userAgent
    );

    if (anomalyDetected) {
      await AuditLogger.logSecurityEvent({
        userId: sessionId,
        action: 'session_anomaly',
        success: false,
        failureReason: 'IP or User Agent changed',
        ipAddress: ip,
        userAgent,
      });

      // Force re-authentication
      const url = new URL(`/${locale}/auth/signin`, request.url);
      url.searchParams.set('reason', 'session_anomaly');
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  // ========================================
  // 8. SUSPICIOUS ACTIVITY DETECTION
  // ========================================
  if (token?.sub) {
    const suspiciousCheck = await AttackPrevention.detectSuspiciousActivity(
      token.sub,
      ip,
      userAgent
    );

    if (suspiciousCheck.suspicious) {
      await AuditLogger.logSecurityEvent({
        userId: token.sub,
        action: 'suspicious_activity',
        success: false,
        failureReason: suspiciousCheck.reasons.join(', '),
        ipAddress: ip,
        userAgent,
      });

      // Don't block immediately, just log
      // Admin can review and take action
    }
  }

  // ========================================
  // 9. CREATE RESPONSE WITH SECURITY HEADERS
  // ========================================
  const response = NextResponse.next();

  // Ultra-secure headers
  const securityHeaders = {
    // Prevent DNS prefetching for privacy
    'X-DNS-Prefetch-Control': 'off',

    // Force HTTPS
    'Strict-Transport-Security':
      'max-age=63072000; includeSubDomains; preload',

    // Prevent MIME sniffing
    'X-Content-Type-Options': 'nosniff',

    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // Enable XSS filter
    'X-XSS-Protection': '1; mode=block',

    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Feature policy
    'Permissions-Policy':
      'camera=(), microphone=(), geolocation=(self), payment=(self), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',

    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdnjs.cloudflare.com https://*.google.com https://*.stripe.com https://*.sentry.io",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.minepi.com https://*.stripe.com https://*.sentry.io wss://*.sentry.io",
      "frame-src 'self' https://*.stripe.com https://*.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; '),

    // Rate limit info
    'X-RateLimit-Limit': rateLimit.max.toString(),
    'X-RateLimit-Remaining': rateLimitCheck.remaining.toString(),
    'X-RateLimit-Reset': rateLimitCheck.resetAt.toISOString(),

    // Custom security headers
    'X-Powered-By': 'Va Travel',
    'X-Request-ID': crypto.randomUUID(),
    'X-Response-Time': `${Date.now() - startTime}ms`,
  };

  // Apply all security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // ========================================
  // 10. LOG REQUEST (for monitoring)
  // ========================================
  if (pathname.startsWith('/api')) {
    // Log API requests
    await AuditLogger.logAction({
      userId: token?.sub,
      action: 'api_request',
      entityType: 'api',
      entityId: pathname,
      ipAddress: ip,
      userAgent,
      metadata: {
        method,
        pathname,
        duration: Date.now() - startTime,
      },
    });
  }

  return response;
}

// Helper function to get locale
function getLocale(request: NextRequest): string | null {
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;
  if (localeCookie && locales.includes(localeCookie)) {
    return localeCookie;
  }

  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage.split(',')[0].split('-')[0];
    if (locales.includes(preferredLocale)) {
      return preferredLocale;
    }
  }

  return null;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
