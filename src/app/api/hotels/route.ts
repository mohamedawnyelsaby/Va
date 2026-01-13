import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '12'),
      cityId: searchParams.get('cityId') || undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      starRating: searchParams.get('starRating') ? parseInt(searchParams.get('starRating')!) : undefined,
      sortBy: searchParams.get('sortBy') || 'rating',
      order: (searchParams.get('order') || 'desc') as 'asc' | 'desc',
      search: searchParams.get('search') || undefined,
    };

    const where: any = { isActive: true };

    if (query.cityId) {
      where.cityId = query.cityId;
    }

    if (query.starRating) {
      where.starRating = { gte: query.starRating };
    }

    if (query.minPrice || query.maxPrice) {
      where.pricePerNight = {};
      if (query.minPrice) where.pricePerNight.gte = query.minPrice;
      if (query.maxPrice) where.pricePerNight.lte = query.maxPrice;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { address: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    orderBy[query.sortBy] = query.order;

    const [hotels, total] = await Promise.all([
      prisma.hotel.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy,
        select: {
          id: true,
          name: true,
          description: true,
          shortDescription: true,
          address: true,
          latitude: true,
          longitude: true,
          starRating: true,
          rating: true,
          reviewCount: true,
          pricePerNight: true,
          currency: true,
          thumbnail: true,
          images: true,
          amenities: true,
          cityId: true,
          isActive: true,
          isFeatured: true,
        },
      }),
      prisma.hotel.count({ where }),
    ]);

    return NextResponse.json({
      hotels,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    console.error('Hotels API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hotels' },
      { status: 500 }
    );
  }
}
