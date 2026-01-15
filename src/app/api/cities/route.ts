// src/app/api/cities/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const country = searchParams.get('country');
    const popular = searchParams.get('popular') === 'true';
    
    const where: any = {};
    
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
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              hotels: true,
              attractions: true,
              restaurants: true,
            },
          },
        },
      }),
      prisma.city.count({ where }),
    ]);
    
    return NextResponse.json({
      cities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Cities API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate slug from name
    const slug = generateSlug(body.name);
    
    // Check if slug already exists
    const existingCity = await prisma.city.findUnique({
      where: { slug },
    });
    
    if (existingCity) {
      return NextResponse.json(
        { error: 'A city with this name already exists' },
        { status: 400 }
      );
    }
    
    const city = await prisma.city.create({
      data: {
        name: body.name,
        slug: slug,
        country: body.country,
        countryCode: body.countryCode,
        description: body.description,
        latitude: body.latitude,
        longitude: body.longitude,
        timezone: body.timezone,
        currency: body.currency || 'USD',
        language: body.language || 'en',
        isPopular: body.isPopular || false,
        images: body.images || [],
        thumbnail: body.thumbnail,
      },
    });
    
    return NextResponse.json(city, { status: 201 });
  } catch (error) {
    console.error('Create city error:', error);
    return NextResponse.json(
      { error: 'Failed to create city' },
      { status: 500 }
    );
  }
}
