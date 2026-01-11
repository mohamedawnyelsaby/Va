import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { CacheService } from '@/lib/cache/redis';
import { z } from 'zod';

const HotelsQuerySchema = z.object({
  cityId: z.string().optional(),
  minPrice: z.string().transform(Number).optional(),
  maxPrice: z.string().transform(Number).optional(),
  rating: z.string().transform(Number).optional(),
  amenities: z.string().optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  sortBy: z.enum(['price', 'rating', 'popular']).default('popular'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = HotelsQuerySchema.parse(
      Object.fromEntries(searchParams.entries())
    );

    const cacheKey = `hotels:${JSON.stringify(query)}`;

    const cachedData = await CacheService.get<{
      hotels: any[];
      total: number;
      page: number;
      totalPages: number;
    }>(cacheKey);

    if (cachedData) {
      return NextResponse.json({
        ...cachedData,
        cached: true,
      });
    }

    const where: any = {
      status: 'published',
    };

    if (query.cityId) {
      where.cityId = query.cityId;
    }

    if (query.minPrice || query.maxPrice) {
      where.pricePerNight = {};
      if (query.minPrice) where.pricePerNight.gte = query.minPrice;
      if (query.maxPrice) where.pricePerNight.lte = query.maxPrice;
    }

    if (query.rating) {
      where.rating = { gte: query.rating };
    }

    if (query.amenities) {
      const amenitiesList = query.amenities.split(',');
      where.amenities = {
        hasEvery: amenitiesList,
      };
    }

    const orderBy: any = {};
    if (query.sortBy === 'price') {
      orderBy.pricePerNight = query.order;
    } else if (query.sortBy === 'rating') {
      orderBy.rating = query.order;
    } else {
      orderBy.viewCount = 'desc';
    }

    const total = await prisma.hotel.count({ where });

    const skip = (query.page - 1) * query.limit;

    const hotels = await prisma.hotel.findMany({
      where,
      orderBy,
      skip,
      take: query.limit,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        thumbnail: true,
        pricePerNight: true,
        currency: true,
        rating: true,
        reviewCount: true,
        amenities: true,
        city: {
          select: {
            id: true,
            name: true,
            slug: true,
            country: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(total / query.limit);

    const response = {
      hotels,
      total,
      page: query.page,
      totalPages,
      hasMore: query.page < totalPages,
    };

    await CacheService.set(cacheKey, response, 1800);

    return NextResponse.json({
      ...response,
      cached: false,
    });
  } catch (error) {
    console.error('Hotels API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
