// src/app/api/hotels/[id]/route.ts
// Single Hotel API - Get, Update, Delete
// SECURITY FIXES: PATCH / DELETE now require an ADMIN (they used to accept
// any logged-in user, so anyone could change prices or delete hotels). PATCH
// input is validated; rating / reviewCount are no longer client-writable.

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/guards';
import { hotelUpdateSchema } from '@/lib/validation/catalog';

// GET /api/hotels/[id] - Get single hotel
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const hotel = await prisma.hotel.findUnique({
      where: { id },
      include: {
        cityRelation: {
          select: { id: true, name: true, slug: true, country: true, countryCode: true },
        },
      },
    });

    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    }

    return NextResponse.json(hotel);
  } catch (error) {
    console.error('Hotel detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch hotel' }, { status: 500 });
  }
}

// PATCH /api/hotels/[id] - Update hotel (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const guard = await requireAdmin();
    if ('response' in guard) {return guard.response;}

    const data = hotelUpdateSchema.parse(await request.json());
    const { roomTypes, ...rest } = data;

    const updateData: Prisma.HotelUpdateInput = { ...rest };
    if (roomTypes) {
      updateData.roomTypes = roomTypes as Prisma.InputJsonValue[];
    }

    const existing = await prisma.hotel.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    }

    const hotel = await prisma.hotel.update({
      where: { id },
      data: updateData,
      include: {
        cityRelation: {
          select: { id: true, name: true, slug: true, country: true },
        },
      },
    });

    return NextResponse.json(hotel);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message, field: error.errors[0].path.join('.') }, { status: 400 });
    }
    console.error('Update hotel error:', error);
    return NextResponse.json({ error: 'Failed to update hotel' }, { status: 500 });
  }
}

// DELETE /api/hotels/[id] - Delete hotel (admin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const guard = await requireAdmin();
    if ('response' in guard) {return guard.response;}

    const existing = await prisma.hotel.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    }

    await prisma.hotel.delete({ where: { id } });

    return NextResponse.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    console.error('Delete hotel error:', error);
    return NextResponse.json({ error: 'Failed to delete hotel' }, { status: 500 });
  }
}
