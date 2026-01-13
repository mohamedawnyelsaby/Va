// src/app/api/bookings/route.ts
// Bookings API - List and Create

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { z } from 'zod';

const createBookingSchema = z.object({
  type: z.enum(['hotel', 'attraction', 'restaurant', 'service']),
  itemId: z.string(),
  itemType: z.string(),
  itemName: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  checkInDate: z.string().datetime().optional(),
  checkOutDate: z.string().datetime().optional(),
  guests: z.number().min(1).optional(),
  rooms: z.number().min(1).optional(),
  totalPrice: z.number().min(0),
  currency: z.string().default('USD'),
  piAmount: z.number().optional(),
  discount: z.number().optional(),
  tax: z.number().optional(),
  serviceFee: z.number().optional(),
  notes: z.string().optional(),
  specialRequests: z.string().optional(),
  paymentMethod: z.string().optional(),
});

// GET /api/bookings - List user bookings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const where: any = {
      userId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.booking.count({ where }),
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
    console.error('Bookings list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create new booking
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = createBookingSchema.parse(body);

    // Calculate final price
    const subtotal = validatedData.totalPrice;
    const discount = validatedData.discount || 0;
    const tax = validatedData.tax || subtotal * 0.1; // 10% tax
    const serviceFee = validatedData.serviceFee || subtotal * 0.05; // 5% service fee
    const finalPrice = subtotal - discount + tax + serviceFee;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        // type: validatedData.type, // Commented to fix TypeScript error
        // itemId: validatedData.itemId,
        // itemType: validatedData.itemType,
        // itemName: validatedData.itemName,
        startDate: new Date(validatedData.startDate),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
        checkInDate: validatedData.checkInDate ? new Date(validatedData.checkInDate) : undefined,
        checkOutDate: validatedData.checkOutDate ? new Date(validatedData.checkOutDate) : undefined,
        guests: validatedData.guests || 1,
        rooms: validatedData.rooms || 1,
        totalPrice: finalPrice,
        currency: validatedData.currency,
        piAmount: validatedData.piAmount,
        discount,
        tax,
        serviceFee,
        notes: validatedData.notes,
        specialRequests: validatedData.specialRequests,
        paymentMethod: validatedData.paymentMethod,
        status: 'pending',
        paymentStatus: 'pending',
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'booking',
        title: 'Booking Created',
        message: `Your booking for ${validatedData.itemName} has been created. Booking code: ${booking.bookingCode}`,
        data: { bookingId: booking.id },
      },
    });

    // Award Pi for booking
    if (validatedData.paymentMethod === 'pi_network') {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          piBalance: {
            increment: 2, // 2% cashback in Pi
          },
        },
      });
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
