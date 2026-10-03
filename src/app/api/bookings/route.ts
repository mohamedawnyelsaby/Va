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

import type { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth/guards';
import { parsePagination } from '@/lib/api-utils';
import { logger } from '@/lib/logger';
import { captureException } from '@/lib/monitoring/sentry';
import { sendRefundRequestEmail } from '@/lib/email/notifications';
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
    let nightlyPrice: number | undefined;
    let roomTypeLabel: string | undefined;
    let hotelRoomTotal: number | undefined;
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
      hotelRoomTotal = room.totalRooms;
      nightlyPrice = room.price;
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
          data: { totalPrice, currency, itemName, roomType: roomTypeLabel },
        });
        return NextResponse.json(
          { ...refreshed, piAmount, nights, nightlyPrice, roomType: roomTypeLabel },
          { status: 200 }
        );
      }
    }

    // Overbooking protection — only runs for a genuinely NEW hotel booking
    // (an identical pending retry above already returned), and only when
    // this room type declares `totalRooms` in its JSON (see RoomType in
    // lib/pricing.ts). No hotel does yet, so this is a no-op until that's
    // set, matching current behaviour exactly for every existing listing.
    if (data.type === 'hotel' && hotelRoomTotal) {
      const requestedRooms = data.rooms ?? 1;
      const overlapping = await prisma.booking.aggregate({
        where: {
          hotelId: data.itemId,
          roomType: roomTypeLabel,
          status: { in: ['pending', 'confirmed', 'refund_requested'] },
          startDate: { lt: endDate },
          endDate: { gt: startDate },
        },
        _sum: { rooms: true },
      });
      const alreadyBooked = overlapping._sum.rooms ?? 0;
      if (alreadyBooked + requestedRooms > hotelRoomTotal) {
        return NextResponse.json(
          { error: `Sold out: only ${Math.max(0, hotelRoomTotal - alreadyBooked)} "${roomTypeLabel}" room(s) left for these dates.` },
          { status: 409 }
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
        roomType: roomTypeLabel,
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
      { ...booking, piAmount, nights, nightlyPrice, roomType: roomTypeLabel },
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
    if (error instanceof Error && error.message.startsWith('PI_PER_')) {
      logger.error('Create booking error: missing conversion rate:', error.message);
      captureException(error, { context: 'bookings POST - missing PI_PER_ rate' });
      return NextResponse.json(
        { error: 'Bookings in this currency are temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
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

    // Case 1: still pending and unpaid — cancel outright, no money ever moved.
    const cancelled = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

    if (cancelled) {
      return NextResponse.json(cancelled);
    }

    // Case 2: already paid. This app has no automated Pi refund (App-to-User
    // payment) wired up yet — that requires the app's own funded Pi wallet
    // and its private seed, which is a credential/decision only the site
    // owner can provide, so real money is never moved here automatically.
    // Instead of a dead-end error, this marks the booking as a tracked
    // refund request and emails ADMIN_EMAIL (if configured) with everything
    // needed to send the refund manually from the Pi Wallet app.
    //
    // Only for bookings that haven't started yet, and only once.
    const refundRequested = await prisma.booking.updateMany({
      where: {
        id: bookingId,
        userId,
        status: 'confirmed',
        paymentStatus: 'paid',
        startDate: { gt: new Date() },
      },
      data: { status: 'refund_requested' },
    });

    if (refundRequested.count === 0) {
      return NextResponse.json(
        { error: 'This booking can no longer be cancelled or refunded.' },
        { status: 400 }
      );
    }

    const [withUser, payment] = await Promise.all([
      prisma.booking.findUnique({ where: { id: bookingId }, include: { user: true } }),
      prisma.payment.findFirst({ where: { bookingId, status: 'completed' }, orderBy: { createdAt: 'desc' } }),
    ]);

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && withUser) {
      sendRefundRequestEmail(adminEmail, {
        bookingId: withUser.id,
        bookingCode: withUser.bookingCode,
        itemName: withUser.itemName,
        userEmail: withUser.user.email,
        userName: withUser.user.name || withUser.user.email,
        userPiWalletId: withUser.user.piWalletId,
        amount: withUser.totalPrice,
        currency: withUser.currency,
        piTxid: payment?.piTxid,
      }).catch((err) => logger.error('[bookings PATCH] refund request email failed:', err));
    } else if (!adminEmail) {
      logger.warn('[bookings PATCH] ADMIN_EMAIL not configured — refund request for booking', bookingId, 'was not emailed to anyone.');
    }

    return NextResponse.json({
      id: bookingId,
      status: 'refund_requested',
      message: 'Refund requested. This is processed manually and may take a few days.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    logger.error('Cancel/refund booking error:', error);
    captureException(error instanceof Error ? error : new Error(String(error)), { context: 'bookings PATCH' });
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
}
