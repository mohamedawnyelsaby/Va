import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';

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

    const subtotal = body.totalPrice || 0;
    const discount = body.discount || 0;
    const tax = body.tax || subtotal * 0.1;
    const serviceFee = body.serviceFee || subtotal * 0.05;
    const finalPrice = subtotal - discount + tax + serviceFee;

    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        checkInDate: body.checkInDate ? new Date(body.checkInDate) : undefined,
        checkOutDate: body.checkOutDate ? new Date(body.checkOutDate) : undefined,
        guests: body.guests || 1,
        rooms: body.rooms || 1,
        totalPrice: finalPrice,
        currency: body.currency || 'USD',
        piAmount: body.piAmount,
        discount,
        tax,
        serviceFee,
        notes: body.notes,
        specialRequests: body.specialRequests,
        paymentMethod: body.paymentMethod,
        status: 'pending',
        paymentStatus: 'pending',
      } as any,
    });

    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'booking',
        title: 'Booking Created',
        message: 'Your booking has been created successfully. Booking code: ' + booking.bookingCode,
        data: { bookingId: booking.id },
      } as any,
    });

    if (body.paymentMethod === 'pi_network') {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          piBalance: {
            increment: 2,
          },
        },
      });
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
