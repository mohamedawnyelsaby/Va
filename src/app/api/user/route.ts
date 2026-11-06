// src/app/api/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { z } from 'zod';

// Must stay in sync with images.remotePatterns in next.config.mjs: next/image
// throws at render time for any other host.
const ALLOWED_IMAGE_HOSTS = new Set([
  'images.unsplash.com',
  'cf.bstatic.com',
  'res.cloudinary.com',
  'lh3.googleusercontent.com',
  'app-cdn.minepi.com',
]);

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  image: z
    .string()
    .url()
    .max(2048)
    .refine((u) => u.startsWith('https://'), 'Image URL must use https')
    .refine((u) => {
      try { return ALLOWED_IMAGE_HOSTS.has(new URL(u).hostname); } catch { return false; }
    }, 'Image host is not allowed')
    .optional(),
});

// Deleting an account cascades to bookings and payments, so it must be an
// explicit, deliberate request.
const deleteSchema = z.object({ confirm: z.literal('DELETE') });

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        piBalance: true,
        piUsername: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bookings: true,
            reviews: true,
            favorites: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: validatedData,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        piBalance: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const confirmation = deleteSchema.safeParse(await request.json().catch(() => null));
    if (!confirmation.success) {
      return NextResponse.json(
        { error: 'Confirmation required: send { "confirm": "DELETE" }' },
        { status: 400 }
      );
    }

    // The schema cascades user -> payments/bookings/payment events, so deleting
    // a user with any money trail would erase the financial records and any
    // pending refund. Refuse until the account has no payment history.
    const paymentTrail = await prisma.payment.count({
      where: {
        userId: session.user.id,
        OR: [
          { status: { in: ['created', 'approved', 'completed', 'refunded'] } },
          { piPaymentId: { not: null } },
          { refundRequestedAt: { not: null } },
        ],
      },
    });
    if (paymentTrail > 0) {
      return NextResponse.json(
        {
          error:
            'This account has payment history and cannot be deleted automatically. Please contact support.',
        },
        { status: 409 }
      );
    }

    await prisma.user.delete({ where: { id: session.user.id } });

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
