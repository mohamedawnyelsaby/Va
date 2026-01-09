// src/app/api/cities/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const country = searchParams.get('country');
    const popular = searchParams.get('popular') === 'true';
    
    const where: any = { isActive: true };
    
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
    
    const city = await prisma.city.create({
      data: {
        name: body.name,
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
