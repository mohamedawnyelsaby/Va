// src/app/api/hotels/route.ts
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
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const starRating = searchParams.get('starRating');
    const sortBy = searchParams.get('sortBy') || 'rating';
    const order = searchParams.get('order') || 'desc';

    const where: any = {};

    if (cityId) {
      where.cityId = cityId;
    }

    if (minPrice || maxPrice) {
      where.pricePerNight = {};
      if (minPrice) where.pricePerNight.gte = parseFloat(minPrice);
      if (maxPrice) where.pricePerNight.lte = parseFloat(maxPrice);
    }

    if (starRating) {
      where.starRating = parseInt(starRating);
    }

    const orderBy: any = {};
    orderBy[sortBy] = order;

    const [hotels, total] = await Promise.all([
      prisma.hotel.findMany({
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
              country: true,
            },
          },
        },
      }),
      prisma.hotel.count({ where }),
    ]);

    return NextResponse.json({
      hotels,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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
    const requiredFields = ['name', 'description', 'address', 'city', 'cityId', 'country', 'latitude', 'longitude', 'starRating', 'pricePerNight', 'currency'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const hotel = await prisma.hotel.create({
      data: {
        name: body.name,
        description: body.description,
        shortDescription: body.shortDescription,
        address: body.address,
        city: body.city,
        cityId: body.cityId,
        country: body.country,
        postalCode: body.postalCode,
        latitude: parseFloat(body.latitude),
        longitude: parseFloat(body.longitude),
        starRating: parseInt(body.starRating),
        amenities: body.amenities || [],
        roomTypes: body.roomTypes || [],
        pricePerNight: parseFloat(body.pricePerNight),
        currency: body.currency,
        images: body.images || [],
        thumbnail: body.thumbnail,
        isFeatured: body.isFeatured || false,
        rating: body.rating || 0,
        reviewCount: body.reviewCount || 0,
        discountRate: body.discountRate || 0,
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

    return NextResponse.json(hotel, { status: 201 });
  } catch (error) {
    console.error('Create hotel error:', error);
    return NextResponse.json(
      { error: 'Failed to create hotel' },
      { status: 500 }
    );
  }
}
