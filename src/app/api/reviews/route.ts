// PATH: src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { parsePagination, isUniqueViolation } from '@/lib/api-utils';

const createReviewSchema = z.object({
  itemId:   z.string().min(1).max(64),
  itemType: z.enum(['hotel', 'attraction', 'restaurant']),
  rating:   z.number().int().min(1).max(5),
  title:    z.string().max(100).optional(),
  comment:  z.string().min(10).max(2000),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // ✅ FIX: guest reviews previously all shared a single hardcoded
    // 'guest@pi.network' account. That meant every anonymous visitor was
    // treated as the SAME user, so once any guest reviewed an item, the
    // "already reviewed" check below blocked every other guest from ever
    // reviewing that same item again — and gave zero real spam protection
    // or traceability. Reviews now require a real, authenticated session.
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'You must be signed in to leave a review' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = createReviewSchema.parse(body);

    // The reviewed item must exist (previously a review for a non-existent
    // item was saved, and then the rating update threw -> 500 + orphan row).
    const model =
      data.itemType === 'hotel' ? prisma.hotel
      : data.itemType === 'attraction' ? prisma.attraction
      : prisma.restaurant;
    const item = await (model as typeof prisma.hotel).findUnique({
      where: { id: data.itemId },
      select: { id: true },
    });
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

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

    // Review + recomputed rating in ONE transaction, using a DB aggregate
    // instead of loading every review into memory.
    const review = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.review.create({
        data: {
          userId,
          itemId: data.itemId,
          itemType: data.itemType,
          rating: data.rating,
          title: data.title,
          comment: data.comment,
        },
      });

      const agg = await tx.review.aggregate({
        where: { itemId: data.itemId, itemType: data.itemType },
        _avg: { rating: true },
        _count: { rating: true },
      });
      const ratingData = {
        rating: parseFloat((agg._avg.rating ?? data.rating).toFixed(1)),
        reviewCount: agg._count.rating,
      };

      if (data.itemType === 'hotel') {
        await tx.hotel.update({ where: { id: data.itemId }, data: ratingData });
      } else if (data.itemType === 'attraction') {
        await tx.attraction.update({ where: { id: data.itemId }, data: ratingData });
      } else {
        await tx.restaurant.update({ where: { id: data.itemId }, data: ratingData });
      }

      return created;
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    // Concurrent double-submit hitting the (userId, itemId, itemType) unique
    // constraint (see prisma/manual-migrations/001_security_constraints.sql).
    if (isUniqueViolation(error)) {
      return NextResponse.json({ error: 'You have already reviewed this item' }, { status: 409 });
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
    const { page, limit, skip } = parsePagination(searchParams, 10, 50);

    if (!itemId || !itemType || !['hotel', 'attraction', 'restaurant'].includes(itemType)) {
      return NextResponse.json({ error: 'itemId and a valid itemType are required' }, { status: 400 });
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { itemId, itemType },
        orderBy: { createdAt: 'desc' },
        skip,
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
