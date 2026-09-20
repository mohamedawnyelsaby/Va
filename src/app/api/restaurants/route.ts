// src/app/api/restaurants/route.ts
// SECURITY FIXES: POST requires an ADMIN and validated input (rating /
// reviewCount are no longer client-controlled); GET pagination is clamped and
// `sortBy` is allow-listed.

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/guards';
import { restaurantBaseSchema } from '@/lib/validation/catalog';
import { parsePagination, pickAllowed } from '@/lib/api-utils';

const SORT_FIELDS = ['rating', 'reviewCount', 'name', 'createdAt'] as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams, 12, 50);
    const cityId = searchParams.get('cityId');
    const cuisine = searchParams.get('cuisine');
    const priceRange = searchParams.get('priceRange');
    const search = searchParams.get('search')?.slice(0, 100);
    const sortBy = pickAllowed(searchParams.get('sortBy'), SORT_FIELDS, 'rating');
    const order: 'asc' | 'desc' = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

    const where: Prisma.RestaurantWhereInput = {};

    if (cityId) {
      where.cityId = cityId;
    }

    if (cuisine) {
      where.cuisine = { has: cuisine };
    }

    if (priceRange) {
      where.priceRange = priceRange;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip,
        take: limit,
        include: {
          cityRelation: {
            select: { id: true, name: true, slug: true, country: true },
          },
        },
      }),
      prisma.restaurant.count({ where }),
    ]);

    return NextResponse.json({
      restaurants,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Restaurants API error:', error);
    return NextResponse.json({ error: 'Failed to fetch restaurants' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if ('response' in guard) {return guard.response;}

    const data = restaurantBaseSchema.parse(await request.json());

    const city = await prisma.city.findUnique({ where: { id: data.cityId }, select: { id: true } });
    if (!city) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name: data.name,
        description: data.description,
        cuisine: data.cuisine,
        priceRange: data.priceRange,
        address: data.address,
        city: data.city,
        cityId: data.cityId,
        country: data.country,
        latitude: data.latitude,
        longitude: data.longitude,
        openingHours: data.openingHours as Prisma.InputJsonValue | undefined,
        reservationRequired: data.reservationRequired ?? false,
        dressCode: data.dressCode,
        features: data.features ?? [],
        images: data.images ?? [],
        thumbnail: data.thumbnail,
        isFeatured: data.isFeatured ?? false,
      },
      include: {
        cityRelation: {
          select: { id: true, name: true, slug: true, country: true },
        },
      },
    });

    return NextResponse.json(restaurant, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message, field: error.errors[0].path.join('.') }, { status: 400 });
    }
    console.error('Create restaurant error:', error);
    return NextResponse.json({ error: 'Failed to create restaurant' }, { status: 500 });
  }
}
