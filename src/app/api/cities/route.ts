// src/app/api/cities/route.ts
// SECURITY FIXES: POST had NO authentication at all — anyone on the internet
// could create cities. It now requires an ADMIN and validated input. GET
// pagination is clamped.

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/guards';
import { citySchema } from '@/lib/validation/catalog';
import { parsePagination } from '@/lib/api-utils';

// Helper function to generate slug from city name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams, 20, 100);
    const search = searchParams.get('search')?.slice(0, 100);
    const country = searchParams.get('country');
    const popular = searchParams.get('popular') === 'true';

    const where: Prisma.CityWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (country) {
      where.country = country;
    }

    if (popular) {
      where.isPopular = true;
    }

    const [cities, total] = await Promise.all([
      prisma.city.findMany({
        where,
        orderBy: popular ? { isPopular: 'desc' } : { name: 'asc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: { hotels: true, attractions: true, restaurants: true },
          },
        },
      }),
      prisma.city.count({ where }),
    ]);

    return NextResponse.json({
      cities,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Cities API error:', error);
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if ('response' in guard) {return guard.response;}

    const data = citySchema.parse(await request.json());
    const slug = generateSlug(data.name);

    if (!slug) {
      return NextResponse.json({ error: 'Invalid city name' }, { status: 400 });
    }

    const existingCity = await prisma.city.findUnique({ where: { slug } });
    if (existingCity) {
      return NextResponse.json({ error: 'A city with this name already exists' }, { status: 400 });
    }

    const city = await prisma.city.create({
      data: {
        name: data.name,
        slug,
        country: data.country,
        countryCode: data.countryCode,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        currency: data.currency || 'USD',
        language: data.language || 'en',
        isPopular: data.isPopular ?? false,
        images: data.images ?? [],
        thumbnail: data.thumbnail,
      },
    });

    return NextResponse.json(city, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message, field: error.errors[0].path.join('.') }, { status: 400 });
    }
    console.error('Create city error:', error);
    return NextResponse.json({ error: 'Failed to create city' }, { status: 500 });
  }
}
