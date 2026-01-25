// src/app/api/bookings/route.ts
'use client';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db';
import { z } from 'zod';

/* ===============================
   Validation
================================ */

const createBookingSchema = z.object({
  type: z.enum(['hotel', 'attraction', 'restaurant']),
  itemId: z.string().cuid(),
  itemName: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  checkInDate: z.string().datetime().optional(),
  checkOutDate: z.string().datetime().optional(),
  guests: z.number().int().min(1).max(20),
  rooms: z.number().int().min(1).max(10).optional(),
  specialRequests: z.string().max(500).optional(),
});

/* ===============================
   GET – User bookings
================================ */

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 10);

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          payments: {
            select: {
              status: true,
              amount: true,
              piTxid: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.booking.count({ where: { userId: session.user.id } }),
    ]);

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

/* ===============================
   POST – Create booking (Pi only)
================================ */

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createBookingSchema.parse(body);

    // Validate item
    let price = 0;
    let currency = 'PI';
    let relation: Record<string, string> = {};

    if (data.type === 'hotel') {
      const hotel = await prisma.hotel.findUnique({
        where: { id: data.itemId },
        select: { pricePerNight: true },
      });
      if (!hotel) throw new Error('Hotel not found');
      price = hotel.pricePerNight;
      relation.hotelId = data.itemId;
    }

    if (data.type === 'attraction') {
      const attraction = await prisma.attraction.findUnique({
        where: { id: data.itemId },
        select: { ticketPrice: true },
      });
      if (!attraction) throw new Error('Attraction not found');
      price = attraction.ticketPrice;
      relation.attractionId = data.itemId;
    }

    if (data.type === 'restaurant') {
      relation.restaurantId = data.itemId;
    }

    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        itemId: data.itemId,
        itemType: data.type,
        itemName: data.itemName,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        checkInDate: data.checkInDate ? new Date(data.checkInDate) : undefined,
        checkOutDate: data.checkOutDate ? new Date(data.checkOutDate) : undefined,
        guests: data.guests,
        rooms: data.rooms,
        totalPrice: price,
        currency,
        status: 'pending',
        paymentStatus: 'unpaid',
        paymentMethod: 'pi_network',
        specialRequests: data.specialRequests,
        ...relation,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

/* ===============================
   PATCH – User can only cancel
================================ */

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await request.json();

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (booking.status !== 'pending') {
      return NextResponse.json({ error: 'Cannot cancel confirmed booking' }, { status: 400 });
    }

    const cancelled = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled' },
    });

    return NextResponse.json(cancelled);
  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
}
