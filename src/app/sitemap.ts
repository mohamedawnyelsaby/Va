// src/app/sitemap.ts
import { MetadataRoute } from 'next';

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

  // Try to fetch dynamic cities, but don't fail if database is unavailable
  try {
    const { prisma } = await import('@/lib/db');
    
    const cities = await prisma.city.findMany({
      select: {
        id: true,
        slug: true,
        updatedAt: true,
      },
      take: 100, // Limit for build performance
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
  } catch (error) {
    console.warn('Unable to fetch cities for sitemap during build:', error);
    // Continue with static pages only
  }

  return sitemap;
}

// Make it dynamic to prevent build-time database requirement
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour
