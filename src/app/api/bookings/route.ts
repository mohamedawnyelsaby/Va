// src/app/api/bookings/route.ts
//
// SECURITY / CORRECTNESS FIXES
// - No more shared "guest@pi.network" user. Every booking belongs to a real
//   authenticated user. (Previously any anonymous visitor could LIST and
//   CANCEL every guest's bookings, and those bookings could never be paid.)
// - The price is computed ONLY on the server: nightly room price x nights x
//   rooms + tax (same formula the UI displays). It used to charge just
//   `pricePerNight`, ignoring nights/rooms/room type, while the UI showed a
//   different total. Restaurants were free.
// - `itemName` comes from the database, not from the client.
// - Dates are validated; pagination is clamped; validation errors return 400.
// - Re-opening the booking page reuses a recent identical pending booking
//   instead of creating a new one on every page load.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth/guards';
import { parsePagination } from '@/lib/api-utils';
import {
  computeHotelTotal,
  countNights,
  resolveNightlyPrice,
  round2,
  toPiAmount,
} from '@/lib/pricing';

const MAX_STAY_NIGHTS = 60;
const REUSE_WINDOW_MS = 30 * 60 * 1000;

const createBookingSchema = z.object({
  type: z.enum(['hotel', 'attraction', 'restaurant']),
  itemId: z.string().min(1).max(64),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  checkInDate: z.string().datetime().optional(),
  checkOutDate: z.string().datetime().optional(),
  guests: z.number().int().min(1).max(20),
  rooms: z.number().int().min(1).max(10).optional(),
  roomType: z.string().max(100).optional(),
  specialRequests: z.string().max(500).optional(),
});

const cancelSchema = z.object({ bookingId: z.string().min(1).max(64) });

/* ===============================
   GET – User bookings
================================ */

export async function GET(request: NextRequest) {
  try {
    const guard = await requireUser();
    if ('response' in guard) {return guard.response;}
    const { userId } = guard;

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams, 10, 50);

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          payments: {
            select: { status: true, amount: true, piTxid: true, createdAt: true },
          },
        },
      }),
      prisma.booking.count({ where: { userId } }),
    ]);

    return NextResponse.json({
      bookings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
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
    const guard = await requireUser();
    if ('response' in guard) {return guard.response;}
    const { userId } = guard;

    const data = createBookingSchema.parse(await request.json());

    const startDate = new Date(data.checkInDate ?? data.startDate);
    const endDateRaw = data.checkOutDate ?? data.endDate;
    const endDate = endDateRaw ? new Date(endDateRaw) : undefined;

    // Allow "today" in any timezone: only reject dates before yesterday (UTC).
    const earliest = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (startDate < earliest) {
      return NextResponse.json({ error: 'Start date is in the past' }, { status: 400 });
    }

    let itemName = '';
    let currency = 'USD';
    let totalPrice = 0;
    let nights: number | undefined;
    let roomTypeLabel: string | undefined;
    const relation: { hotelId?: string; attractionId?: string; restaurantId?: string } = {};

    if (data.type === 'hotel') {
      if (!endDate || endDate <= startDate) {
        return NextResponse.json(
          { error: 'Check-out must be after check-in' },
          { status: 400 }
        );
      }
      nights = countNights(startDate, endDate);
      if (nights > MAX_STAY_NIGHTS) {
        return NextResponse.json(
          { error: `Maximum stay is ${MAX_STAY_NIGHTS} nights` },
          { status: 400 }
        );
      }

      const hotel = await prisma.hotel.findUnique({
        where: { id: data.itemId },
        select: { name: true, pricePerNight: true, roomTypes: true, currency: true },
      });
      if (!hotel) {
        return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
      }

      const room = resolveNightlyPrice(hotel, data.roomType);
      roomTypeLabel = room.roomType;
      totalPrice = computeHotelTotal({
        nightlyPrice: room.price,
        nights,
        rooms: data.rooms ?? 1,
      });
      itemName = hotel.name;
      currency = hotel.currency;
      relation.hotelId = data.itemId;
    }

    if (data.type === 'attraction') {
      const attraction = await prisma.attraction.findUnique({
        where: { id: data.itemId },
        select: { name: true, ticketPrice: true, currency: true },
      });
      if (!attraction) {
        return NextResponse.json({ error: 'Attraction not found' }, { status: 404 });
      }
      totalPrice = round2(attraction.ticketPrice * data.guests);
      itemName = attraction.name;
      currency = attraction.currency;
      relation.attractionId = data.itemId;
    }

    if (data.type === 'restaurant') {
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: data.itemId },
        select: { name: true },
      });
      if (!restaurant) {
        return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
      }
      itemName = restaurant.name;
      relation.restaurantId = data.itemId;
    }

    const requiresPayment = totalPrice > 0;
    const piAmount = requiresPayment ? toPiAmount(totalPrice, currency) : 0;

    // Reuse an identical, recent, still-unpaid booking (page refresh / retry).
    if (requiresPayment) {
      const existing = await prisma.booking.findFirst({
        where: {
          userId,
          itemId: data.itemId,
          itemType: data.type,
          status: 'pending',
          paymentStatus: 'unpaid',
          startDate,
          endDate: endDate ?? null,
          guests: data.guests,
          rooms: data.rooms ?? 1,
          createdAt: { gt: new Date(Date.now() - REUSE_WINDOW_MS) },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (existing) {
        const refreshed = await prisma.booking.update({
          where: { id: existing.id },
          data: { totalPrice, currency, itemName },
        });
        return NextResponse.json(
          { ...refreshed, piAmount, nights, roomType: roomTypeLabel },
          { status: 200 }
        );
      }
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        itemId: data.itemId,
        itemType: data.type,
        itemName,
        startDate,
        endDate,
        checkInDate: data.type === 'hotel' ? startDate : undefined,
        checkOutDate: data.type === 'hotel' ? endDate : undefined,
        guests: data.guests,
        rooms: data.rooms ?? 1,
        totalPrice,
        currency,
        // Nothing to pay (e.g. a restaurant reservation) -> confirmed directly.
        status: requiresPayment ? 'pending' : 'confirmed',
        paymentStatus: requiresPayment ? 'unpaid' : 'not_required',
        paymentMethod: requiresPayment ? 'pi_network' : null,
        specialRequests: data.specialRequests,
        ...relation,
      },
    });

    return NextResponse.json(
      { ...booking, piAmount, nights, roomType: roomTypeLabel },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message, field: error.errors[0].path.join('.') },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message === 'UNKNOWN_ROOM_TYPE') {
      return NextResponse.json({ error: 'Unknown room type' }, { status: 400 });
    }
    console.error('Create booking error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

/* ===============================
   PATCH – User can only cancel
================================ */

export async function PATCH(request: NextRequest) {
  try {
    const guard = await requireUser();
    if ('response' in guard) {return guard.response;}
    const { userId } = guard;

    const { bookingId } = cancelSchema.parse(await request.json());

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only bookings that are still pending AND unpaid can be cancelled here.
    // (A payment that is approved / processing must be handled as a refund.)
    const cancelled = await prisma.$transaction(async (tx) => {
      const res = await tx.booking.updateMany({
        where: { id: bookingId, userId, status: 'pending', paymentStatus: 'unpaid' },
        data: { status: 'cancelled' },
      });
      if (res.count === 0) {return null;}

      await tx.payment.updateMany({
        where: { bookingId, status: 'pending' },
        data: { status: 'cancelled' },
      });
      return tx.booking.findUnique({ where: { id: bookingId } });
    });

    if (!cancelled) {
      return NextResponse.json(
        { error: 'This booking can no longer be cancelled' },
        { status: 400 }
      );
    }

    return NextResponse.json(cancelled);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Cancel booking error:', error);
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
}
