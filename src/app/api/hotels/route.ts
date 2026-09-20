// src/app/api/hotels/route.ts
// SECURITY FIXES:
// - POST now requires an ADMIN (it used to accept any logged-in user, which
//   let anyone create hotels — and, via PATCH, set their own prices).
// - Body is validated with zod; `rating` / `reviewCount` are no longer
//   client-controlled.
// - GET: pagination is clamped, `sortBy` is allow-listed (it used to be passed
//   straight into Prisma's orderBy), numeric filters can no longer be NaN.

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/guards';
import { hotelCreateSchema } from '@/lib/validation/catalog';
import { parsePagination, pickAllowed, parseFiniteNumber, clampInt } from '@/lib/api-utils';

const SORT_FIELDS = ['rating', 'reviewCount', 'pricePerNight', 'starRating', 'name', 'createdAt'] as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams, 12, 50);
    const cityId = searchParams.get('cityId');
    const minPrice = parseFiniteNumber(searchParams.get('minPrice'));
    const maxPrice = parseFiniteNumber(searchParams.get('maxPrice'));
    const starRating = clampInt(searchParams.get('starRating'), 0, 0, 5);
    const sortBy = pickAllowed(searchParams.get('sortBy'), SORT_FIELDS, 'rating');
    const order: 'asc' | 'desc' = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

    const where: Prisma.HotelWhereInput = {};

    if (cityId) {
      where.cityId = cityId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.pricePerNight = {};
      if (minPrice !== undefined) {where.pricePerNight.gte = minPrice;}
      if (maxPrice !== undefined) {where.pricePerNight.lte = maxPrice;}
    }

    if (starRating > 0) {
      where.starRating = starRating;
    }

    const [hotels, total] = await Promise.all([
      prisma.hotel.findMany({
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
      prisma.hotel.count({ where }),
    ]);

    return NextResponse.json({
      hotels,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Hotels API error:', error);
    return NextResponse.json({ error: 'Failed to fetch hotels' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if ('response' in guard) {return guard.response;}

    const data = hotelCreateSchema.parse(await request.json());

    const city = await prisma.city.findUnique({ where: { id: data.cityId }, select: { id: true } });
    if (!city) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }

    const hotel = await prisma.hotel.create({
      data: {
        name: data.name,
        description: data.description,
        shortDescription: data.shortDescription,
        address: data.address,
        city: data.city,
        cityId: data.cityId,
        country: data.country,
        postalCode: data.postalCode,
        latitude: data.latitude,
        longitude: data.longitude,
        starRating: data.starRating,
        amenities: data.amenities ?? [],
        roomTypes: (data.roomTypes ?? []) as Prisma.InputJsonValue[],
        pricePerNight: data.pricePerNight,
        currency: data.currency,
        images: data.images ?? [],
        thumbnail: data.thumbnail,
        isFeatured: data.isFeatured ?? false,
        discountRate: data.discountRate ?? 0,
      },
      include: {
        cityRelation: {
          select: { id: true, name: true, slug: true, country: true },
        },
      },
    });

    return NextResponse.json(hotel, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message, field: error.errors[0].path.join('.') }, { status: 400 });
    }
    console.error('Create hotel error:', error);
    return NextResponse.json({ error: 'Failed to create hotel' }, { status: 500 });
  }
}
