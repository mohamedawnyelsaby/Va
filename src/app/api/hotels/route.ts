// src/app/api/hotels/route.ts
// Hotels API - List and Create

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';

// GET /api/hotels - List hotels with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const cityId = searchParams.get('cityId');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const starRating = searchParams.get('starRating');
    const sortBy = searchParams.get('sortBy') || 'rating';
    const order = searchParams.get('order') || 'desc';
    const search = searchParams.get('search');
    const isFeatured = searchParams.get('featured') === 'true';
    
    // Build where clause
    const where: any = {
      isActive: true,
    };
    
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
    
    if (isFeatured) {
      where.isFeatured = true;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { cityName: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Build orderBy
    const orderBy: any = {};
    orderBy[sortBy] = order;
    
    // Execute query with pagination
    const [hotels, total] = await Promise.all([
      prisma.hotel.findMany({
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

// POST /api/hotels - Create new hotel (Admin only)
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
    const requiredFields = ['name', 'description', 'address', 'cityId', 'latitude', 'longitude', 'pricePerNight'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Get city info
    const city = await prisma.city.findUnique({
      where: { id: body.cityId },
    });
    
    if (!city) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      );
    }
    
    // Create hotel
    const hotel = await prisma.hotel.create({
      data: {
        name: body.name,
        description: body.description,
        shortDescription: body.shortDescription || body.description.substring(0, 150),
        address: body.address,
        cityId: body.cityId,
        cityName: city.name,
        country: city.country,
        postalCode: body.postalCode,
        latitude: body.latitude,
        longitude: body.longitude,
        starRating: body.starRating || 3,
        amenities: body.amenities || [],
        roomTypes: body.roomTypes || [],
        pricePerNight: body.pricePerNight,
        currency: body.currency || 'USD',
        discountRate: body.discountRate || 0,
        isFeatured: body.isFeatured || false,
        checkInTime: body.checkInTime || '14:00',
        checkOutTime: body.checkOutTime || '12:00',
        images: body.images || [],
        thumbnail: body.thumbnail || (body.images?.[0] || ''),
      },
      include: {
        city: true,
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
