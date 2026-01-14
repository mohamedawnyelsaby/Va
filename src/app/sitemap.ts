import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

const BASE_URL = 'https://va-pied.vercel.app';
const LOCALES = ['en', 'ar', 'fr', 'es', 'de', 'it', 'ru', 'zh', 'ja', 'ko'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemap: MetadataRoute.Sitemap = [];

  // Static pages
  const staticPages = [
    '',
    '/about',
    '/contact',
    '/faq',
    '/privacy',
    '/terms',
    '/hotels',
    '/attractions',
    '/restaurants',
  ];

  staticPages.forEach((page) => {
    LOCALES.forEach((locale) => {
      sitemap.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: page === '' ? 1.0 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [l, `${BASE_URL}/${l}${page}`])
          ),
        },
      });
    });
  });

  // Dynamic city pages
  const cities = await prisma.city.findMany({
    select: {
      id: true,
      slug: true,
      updatedAt: true,
    },
  });

  cities.forEach((city) => {
    LOCALES.forEach((locale) => {
      sitemap.push({
        url: `${BASE_URL}/${locale}/cities/${city.slug}`,
        lastModified: city.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [
              l,
              `${BASE_URL}/${l}/cities/${city.slug}`,
            ])
          ),
        },
      });
    });
  });

  return sitemap;
}
