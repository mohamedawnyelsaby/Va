import { MetadataRoute } from 'next';

const BASE_URL = 'https://vatravel.com';

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
    sitemap: [
      `${BASE_URL}/sitemap.xml`,
      `${BASE_URL}/sitemap-hotels.xml`,
      `${BASE_URL}/sitemap-cities.xml`,
      `${BASE_URL}/sitemap-attractions.xml`,
    ],
    host: BASE_URL,
  };
}
