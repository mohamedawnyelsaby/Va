/**
 * SEO & Meta Tags Utility
 * High-Tech Gradient VA Travel Platform
 */

export interface MetaTagsProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  locale?: string;
  author?: string;
  keywords?: string[];
}

/**
 * Generate meta tags for SEO
 */
export function generateMetaTags({
  title,
  description,
  image = 'https://va-travel.app/og-image.jpg',
  url = 'https://va-travel.app',
  type = 'website',
  locale = 'en',
  author = 'VA Travel',
  keywords = [],
}: MetaTagsProps) {
  const fullUrl = `${url}`;

  return {
    // Basic meta tags
    title,
    description,
    keywords: keywords.length ? keywords.join(', ') : 'travel, booking, hotels, attractions, ai assistant',

    // OpenGraph tags
    'og:title': title,
    'og:description': description,
    'og:image': image,
    'og:url': fullUrl,
    'og:type': type,
    'og:site_name': 'VA Travel',
    'og:locale': locale,

    // Twitter Card tags
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': image,
    'twitter:creator': '@VATravel',
    'twitter:site': '@VATravel',

    // Additional meta tags
    'robots': 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    'charset': 'utf-8',
    'viewport': 'width=device-width, initial-scale=1, viewport-fit=cover',
    'theme-color': '#0A0E27',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'format-detection': 'telephone=no',
    'author': author,
    'referrer': 'strict-origin-when-cross-origin',
  };
}

/**
 * Generate structured data (JSON-LD)
 */
export function generateStructuredData(type: string, data: Record<string, any>) {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
  };

  switch (type) {
    case 'Organization':
      return {
        ...baseData,
        name: 'VA Travel',
        url: 'https://va-travel.app',
        logo: 'https://va-travel.app/logo.png',
        description: 'World\'s leading AI-powered travel platform',
        sameAs: [
          'https://twitter.com/VATravel',
          'https://facebook.com/VATravel',
          'https://linkedin.com/company/VATravel',
        ],
        ...data,
      };

    case 'LocalBusiness':
      return {
        ...baseData,
        address: {
          '@type': 'PostalAddress',
          streetAddress: data.streetAddress,
          addressLocality: data.city,
          addressCountry: data.country,
        },
        telephone: data.phone,
        email: data.email,
        ...data,
      };

    case 'BreadcrumbList':
      return {
        ...baseData,
        itemListElement: data.items.map((item: any, index: number) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      };

    case 'Product':
      return {
        ...baseData,
        name: data.name,
        description: data.description,
        image: data.image,
        brand: 'VA Travel',
        offers: {
          '@type': 'Offer',
          price: data.price,
          priceCurrency: data.currency || 'USD',
          availability: 'https://schema.org/InStock',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: data.rating,
          ratingCount: data.ratingCount,
        },
        ...data,
      };

    case 'Event':
      return {
        ...baseData,
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        location: {
          '@type': 'Place',
          name: data.locationName,
          address: data.locationAddress,
        },
        offers: {
          '@type': 'Offer',
          price: data.price,
          priceCurrency: data.currency || 'USD',
        },
        ...data,
      };

    default:
      return { ...baseData, ...data };
  }
}

/**
 * Generate sitemap entry
 */
export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export function generateSitemapXML(entries: SitemapEntry[]): string {
  const xmlEntries = entries
    .map((entry) => {
      return `  <url>
    <loc>${escapeXML(entry.url)}</loc>
    ${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}
    ${entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : ''}
    ${entry.priority ? `<priority>${entry.priority}</priority>` : ''}
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`;
}

/**
 * Escape XML special characters
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /*.json$
Disallow: /private/

User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 1

Sitemap: https://va-travel.app/sitemap.xml

# AdsBot
User-agent: AdsBot-Google
Allow: /
`;
}

/**
 * Generate canonical URL
 */
export function getCanonicalUrl(pathname: string, baseUrl: string = 'https://va-travel.app'): string {
  return `${baseUrl}${pathname}`;
}

/**
 * Generate hreflang tags for multilingual content
 */
export interface HrefLang {
  lang: string;
  url: string;
}

export function generateHrefLangTags(hrefLangs: HrefLang[]): string {
  return hrefLangs
    .map(
      ({ lang, url }) =>
        `<link rel="alternate" hreflang="${lang}" href="${url}" />`
    )
    .join('\n');
}

/**
 * Performance & Core Web Vitals hints
 */
export function getPerformanceHints() {
  return {
    preconnect: [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://cdn.jsdelivr.net',
    ],
    prefetch: [
      '/api/destinations',
      '/api/featured-hotels',
    ],
    preload: [
      '/fonts/inter.woff2',
    ],
  };
}
