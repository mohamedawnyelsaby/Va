import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { z } from 'zod';

const createRestaurantSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().min(50).max(5000),
  cityId: z.string().cuid(),
  cuisine: z.array(z.string()).min(1),
  priceRange: z.enum(['$', '$$', '$$$', '$$$$']),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().min(5),
  openingHours: z.any().optional(),
  reservationRequired: z.boolean().default(false),
  dressCode: z.string().optional(),
  features: z.array(z.string()).default([]),
  images: z.array(z.string().url()),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const cityId = searchParams.get('cityId');
    const cuisine = searchParams.get('cuisine');
    const priceRange = searchParams.get('priceRange');
    const sortBy = searchParams.get('sortBy') || 'rating';
    const order = searchParams.get('order') || 'desc';
    const search = searchParams.get('search');
    const isFeatured = searchParams.get('featured') === 'true';
    
    const where: any = { isActive: true };
    
    if (cityId) where.cityId = cityId;
    if (cuisine) where.cuisine = { has: cuisine };
    if (priceRange) where.priceRange = priceRange;
    if (isFeatured) where.isFeatured = true;
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          cityRelation: {
            select: { id: true, name: true, country: true },
          },
          _count: { select: { reviews: true, bookings: true } },
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
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const validatedData = createRestaurantSchema.parse(body);
    
    const city = await prisma.city.findUnique({
      where: { id: validatedData.cityId },
    });
    
    if (!city) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }
    
    const { cityId, images, ...restaurantData } = validatedData;
    
    const restaurant = await prisma.restaurant.create({
      data: {
        ...restaurantData,
        city: city.name,
        country: city.country,
        thumbnail: images[0],
        images: images,
        cityRelation: {
          connect: { id: cityId }
        }
      },
      include: { cityRelation: true },
    });
    
    return NextResponse.json(restaurant, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    
    console.error('Create restaurant error:', error);
    return NextResponse.json({ error: 'Failed to create restaurant' }, { status: 500 });
  }
}
