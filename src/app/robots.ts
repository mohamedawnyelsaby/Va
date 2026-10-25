import { MetadataRoute } from 'next';

// robots.txt used to point crawlers at https://vatravel.com (not this site) and
// list three sitemap files this app does not serve. Only /sitemap.xml exists.
const BASE_URL = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://va-pied.vercel.app').replace(/\/$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/private/',
          '*/auth/*',
          '*/dashboard/*',
          '*/settings/*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/private/'],
        crawlDelay: 0,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/private/'],
        crawlDelay: 1,
      },
    ],
    sitemap: [`${BASE_URL}/sitemap.xml`],
    host: BASE_URL,
  };
}
