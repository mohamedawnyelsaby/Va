// src/app/api/restaurants/route.ts
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
    const cuisine = searchParams.get('cuisine');
    const priceRange = searchParams.get('priceRange');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'rating';
    const order = searchParams.get('order') || 'desc';

    const where: any = {};

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

    const orderBy: any = {};
    orderBy[sortBy] = order;

    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          cityRelation: {
            select: { 
              id: true, 
              name: true, 
              slug: true,
              country: true 
            },
          },
        },
      }),
      prisma.restaurant.count({ where }),
    ]);

    return NextResponse.json({
      restaurants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Restaurants API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
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

    // Validate required fields
    const requiredFields = ['name', 'description', 'cuisine', 'priceRange', 'address', 'city', 'cityId', 'country', 'latitude', 'longitude'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name: body.name,
        description: body.description,
        cuisine: body.cuisine,
        priceRange: body.priceRange,
        address: body.address,
        city: body.city,
        cityId: body.cityId,
        country: body.country,
        latitude: parseFloat(body.latitude),
        longitude: parseFloat(body.longitude),
        openingHours: body.openingHours,
        reservationRequired: body.reservationRequired || false,
        dressCode: body.dressCode,
        features: body.features || [],
        images: body.images || [],
        thumbnail: body.thumbnail,
        isFeatured: body.isFeatured || false,
        rating: body.rating || 0,
        reviewCount: body.reviewCount || 0,
      },
      include: {
        cityRelation: {
          select: {
            id: true,
            name: true,
            slug: true,
            country: true,
          },
        },
      },
    });

    return NextResponse.json(restaurant, { status: 201 });
  } catch (error) {
    console.error('Create restaurant error:', error);
    return NextResponse.json(
      { error: 'Failed to create restaurant' },
      { status: 500 }
    );
  }
}
