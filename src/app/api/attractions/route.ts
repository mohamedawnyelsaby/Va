// src/app/api/attractions/route.ts
// SECURITY FIXES: POST requires an ADMIN and validated input; GET pagination
// is clamped and `sortBy` is allow-listed.

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/guards';
import { attractionBaseSchema } from '@/lib/validation/catalog';
import { parsePagination, pickAllowed, parseFiniteNumber } from '@/lib/api-utils';

const SORT_FIELDS = ['rating', 'reviewCount', 'ticketPrice', 'name', 'createdAt'] as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams, 12, 50);
    const cityId = searchParams.get('cityId');
    const category = searchParams.get('category');
    const minPrice = parseFiniteNumber(searchParams.get('minPrice'));
    const maxPrice = parseFiniteNumber(searchParams.get('maxPrice'));
    const sortBy = pickAllowed(searchParams.get('sortBy'), SORT_FIELDS, 'rating');
    const order: 'asc' | 'desc' = searchParams.get('order') === 'asc' ? 'asc' : 'desc';
    const search = searchParams.get('search')?.slice(0, 100);
    const isPopular = searchParams.get('popular') === 'true';

    const where: Prisma.AttractionWhereInput = {};

    if (cityId) {
      where.cityId = cityId;
    }

    if (category) {
      where.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.ticketPrice = {};
      if (minPrice !== undefined) {where.ticketPrice.gte = minPrice;}
      if (maxPrice !== undefined) {where.ticketPrice.lte = maxPrice;}
    }

    if (isPopular) {
      where.isPopular = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [attractions, total] = await Promise.all([
      prisma.attraction.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip,
        take: limit,
        include: {
          cityRelation: {
            select: { id: true, name: true, slug: true, country: true, countryCode: true },
          },
        },
      }),
      prisma.attraction.count({ where }),
    ]);

    return NextResponse.json({
      attractions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Attractions API error:', error);
    return NextResponse.json({ error: 'Failed to fetch attractions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if ('response' in guard) {return guard.response;}

    const data = attractionBaseSchema.parse(await request.json());

    const city = await prisma.city.findUnique({ where: { id: data.cityId } });
    if (!city) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }

    const attraction = await prisma.attraction.create({
      data: {
        name: data.name,
        description: data.description,
        shortDescription: data.shortDescription || data.description.substring(0, 150),
        category: data.category,
        subcategory: data.subcategory,
        address: data.address,
        city: city.name,
        country: city.country,
        latitude: data.latitude,
        longitude: data.longitude,
        ticketPrice: data.ticketPrice,
        currency: data.currency || city.currency,
        openingHours: data.openingHours as Prisma.InputJsonValue | undefined,
        duration: data.duration,
        accessibility: data.accessibility ?? [],
        images: data.images ?? [],
        thumbnail: data.thumbnail || data.images?.[0] || '',
        cityId: data.cityId,
        isPopular: data.isPopular ?? false,
      },
    });

    return NextResponse.json(attraction, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message, field: error.errors[0].path.join('.') }, { status: 400 });
    }
    console.error('Create attraction error:', error);
    return NextResponse.json({ error: 'Failed to create attraction' }, { status: 500 });
  }
}
