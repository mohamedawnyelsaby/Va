// src/app/api/hotels/[id]/route.ts
// Single Hotel API - Get, Update, Delete
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';

// GET /api/hotels/[id] - Get single hotel
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hotel = await prisma.hotel.findUnique({
      where: { id: params.id },
      include: {
        cityRelation: {
          select: {
            id: true,
            name: true,
            slug: true,
            country: true,
            countryCode: true,
          },
        },
      },
    });

    if (!hotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(hotel);
  } catch (error) {
    console.error('Hotel detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hotel' },
      { status: 500 }
    );
  }
}

// PATCH /api/hotels/[id] - Update hotel
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Only update fields that exist in the schema
    const updateData: any = {};
    
    if (body.name) updateData.name = body.name;
    if (body.description) updateData.description = body.description;
    if (body.shortDescription) updateData.shortDescription = body.shortDescription;
    if (body.address) updateData.address = body.address;
    if (body.starRating) updateData.starRating = body.starRating;
    if (body.amenities) updateData.amenities = body.amenities;
    if (body.roomTypes) updateData.roomTypes = body.roomTypes;
    if (body.pricePerNight) updateData.pricePerNight = body.pricePerNight;
    if (body.currency) updateData.currency = body.currency;
    if (body.images) updateData.images = body.images;
    if (body.thumbnail) updateData.thumbnail = body.thumbnail;
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
    if (body.rating) updateData.rating = body.rating;
    if (body.reviewCount) updateData.reviewCount = body.reviewCount;

    const hotel = await prisma.hotel.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(hotel);
  } catch (error) {
    console.error('Update hotel error:', error);
    return NextResponse.json(
      { error: 'Failed to update hotel' },
      { status: 500 }
    );
  }
}

// DELETE /api/hotels/[id] - Delete hotel
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Hard delete since isActive doesn't exist in schema
    await prisma.hotel.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: 'Hotel deleted successfully',
    });
  } catch (error) {
    console.error('Delete hotel error:', error);
    return NextResponse.json(
      { error: 'Failed to delete hotel' },
      { status: 500 }
    );
  }
}
