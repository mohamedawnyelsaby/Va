// src/app/api/attractions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const cityId = searchParams.get('cityId');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'rating';
    const order = searchParams.get('order') || 'desc';
    const search = searchParams.get('search');
    const isPopular = searchParams.get('popular') === 'true';
    
    const where: any = { isActive: true };
    
    if (cityId) {
      where.cityId = cityId;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (minPrice || maxPrice) {
      where.ticketPrice = {};
      if (minPrice) where.ticketPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.ticketPrice.lte = parseFloat(maxPrice);
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
    
    const orderBy: any = {};
    orderBy[sortBy] = order;
    
    const [attractions, total] = await Promise.all([
      prisma.attraction.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          city: {
            select: {
              id: true,
              name: true,
              country: true,
            },
          },
          _count: {
            select: {
              reviews: true,
              bookings: true,
            },
          },
        },
      }),
      prisma.attraction.count({ where }),
    ]);
    
    return NextResponse.json({
      attractions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Attractions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attractions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    const city = await prisma.city.findUnique({
      where: { id: body.cityId },
    });
    
    if (!city) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      );
    }
    
    const attraction = await prisma.attraction.create({
      data: {
        name: body.name,
        description: body.description,
        shortDescription: body.shortDescription || body.description.substring(0, 150),
        category: body.category,
        subcategory: body.subcategory,
        address: body.address,
        city: city.name,
        country: city.country,
        latitude: body.latitude,
        longitude: body.longitude,
        ticketPrice: body.ticketPrice,
        currency: body.currency || city.currency,
        openingHours: body.openingHours,
        duration: body.duration,
        images: body.images || [],
        thumbnail: body.thumbnail || (body.images?.[0] || ''),
        cityId: body.cityId,
        isPopular: body.isPopular || false,
      },
      include: {
        city: true,
      },
    });
    
    return NextResponse.json(attraction, { status: 201 });
  } catch (error) {
    console.error('Create attraction error:', error);
    return NextResponse.json(
      { error: 'Failed to create attraction' },
      { status: 500 }
    );
  }
}
