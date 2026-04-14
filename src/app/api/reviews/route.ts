// PATH: src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createReviewSchema = z.object({
  itemId:   z.string().cuid(),
  itemType: z.enum(['hotel', 'attraction', 'restaurant']),
  rating:   z.number().int().min(1).max(5),
  title:    z.string().max(100).optional(),
  comment:  z.string().min(10).max(2000),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    let userId = session?.user?.id;
    if (!userId) {
      // Guest reviews allowed with a guest account
      let guest = await prisma.user.findFirst({ where: { email: 'guest@pi.network' } });
      if (!guest) {
        guest = await prisma.user.create({
          data: { email: 'guest@pi.network', name: 'Guest User', emailVerified: new Date() },
        });
      }
      userId = guest.id;
    }

    const body = await request.json();
    const data = createReviewSchema.parse(body);

    // Check if user already reviewed this item
    const existing = await prisma.review.findFirst({
      where: { userId, itemId: data.itemId, itemType: data.itemType },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'You have already reviewed this item' },
        { status: 409 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId,
        itemId: data.itemId,
        itemType: data.itemType,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
      },
    });

    // Update average rating on the item
    const allReviews = await prisma.review.findMany({
      where: { itemId: data.itemId, itemType: data.itemType },
      select: { rating: true },
    });

    const avgRating = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    const count = allReviews.length;

    if (data.itemType === 'hotel') {
      await prisma.hotel.update({
        where: { id: data.itemId },
        data: { rating: parseFloat(avgRating.toFixed(1)), reviewCount: count },
      });
    } else if (data.itemType === 'attraction') {
      await prisma.attraction.update({
        where: { id: data.itemId },
        data: { rating: parseFloat(avgRating.toFixed(1)), reviewCount: count },
      });
    } else if (data.itemType === 'restaurant') {
      await prisma.restaurant.update({
        where: { id: data.itemId },
        data: { rating: parseFloat(avgRating.toFixed(1)), reviewCount: count },
      });
    }

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Review creation error:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId   = searchParams.get('itemId');
    const itemType = searchParams.get('itemType');
    const page     = parseInt(searchParams.get('page') || '1');
    const limit    = parseInt(searchParams.get('limit') || '10');

    if (!itemId || !itemType) {
      return NextResponse.json({ error: 'itemId and itemType required' }, { status: 400 });
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { itemId, itemType },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      }),
      prisma.review.count({ where: { itemId, itemType } }),
    ]);

    return NextResponse.json({
      reviews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
