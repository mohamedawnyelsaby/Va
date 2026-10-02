// src/app/api/favorites/route.ts
//
// Backs the "save to favorites" heart buttons on hotel/attraction/restaurant
// detail pages, and the /favorites page itself.
//
// Before this route existed, favoriting was two disconnected localStorage
// systems that never talked to each other or to the database (see the
// commit message for the full story) — a user could "save" a real hotel
// and never see it again anywhere. This makes it real: one source of
// truth, tied to the account, syncs across devices.
//
// GET  ?itemId=X&itemType=Y  -> { isFavorited: boolean }   (for a detail page)
// GET  (no params)           -> { favorites: [...], pagination }  (for the list page)
// POST { itemId, itemType }  -> add (idempotent)
// DELETE { itemId, itemType } -> remove (idempotent)

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth/guards';
import { checkRateLimit } from '@/lib/rate-limit';
import { clampInt } from '@/lib/api-utils';
import { logger } from '@/lib/logger';

const ITEM_TYPES = ['hotel', 'attraction', 'restaurant'] as const;
type ItemType = (typeof ITEM_TYPES)[number];

const bodySchema = z.object({
  itemId: z.string().min(1).max(64),
  itemType: z.enum(ITEM_TYPES),
});

function fkField(itemType: ItemType): 'hotelId' | 'attractionId' | 'restaurantId' {
  return itemType === 'hotel' ? 'hotelId' : itemType === 'attraction' ? 'attractionId' : 'restaurantId';
}

export async function GET(request: NextRequest) {
  const guard = await requireUser();
  if ('response' in guard) {return guard.response;}
  const { userId } = guard;

  const { searchParams } = request.nextUrl;
  const itemId = searchParams.get('itemId');
  const itemTypeRaw = searchParams.get('itemType');

  try {
    // Single-item check, used by detail pages to render the heart state.
    if (itemId && itemTypeRaw) {
      if (!ITEM_TYPES.includes(itemTypeRaw as ItemType)) {
        return NextResponse.json({ error: 'Invalid itemType' }, { status: 400 });
      }
      const existing = await prisma.favorite.findUnique({
        where: { userId_itemId_itemType: { userId, itemId, itemType: itemTypeRaw } },
        select: { id: true },
      });
      return NextResponse.json({ isFavorited: !!existing });
    }

    // Full list, used by the /favorites page.
    const page = clampInt(searchParams.get('page'), 1, 1, 10_000);
    const limit = clampInt(searchParams.get('limit'), 20, 1, 50);

    const favoriteInclude = {
      hotel: { select: { id: true, name: true, city: true, country: true, thumbnail: true, pricePerNight: true, currency: true, rating: true } },
      attraction: { select: { id: true, name: true, city: true, country: true, thumbnail: true, ticketPrice: true, currency: true, rating: true } },
      restaurant: { select: { id: true, name: true, city: true, country: true, thumbnail: true, priceRange: true, rating: true } },
    } satisfies Prisma.FavoriteInclude;

    type FavoriteRow = Prisma.FavoriteGetPayload<{ include: typeof favoriteInclude }>;

    const [favorites, total]: [FavoriteRow[], number] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: favoriteInclude,
      }),
      prisma.favorite.count({ where: { userId } }),
    ]);

    // Flatten into a single shape the frontend can render without caring
    // which of the three tables the item actually lives in. An item that
    // was deleted from its catalog after being favorited is dropped here
    // (favorite.hotel/.attraction/.restaurant will be null) rather than
    // shown as a broken card.
    const items = favorites
      .map((f: FavoriteRow) => {
        const item = f.hotel || f.attraction || f.restaurant;
        if (!item) {return null;}
        return {
          favoriteId: f.id,
          itemId: f.itemId,
          itemType: f.itemType,
          savedAt: f.createdAt,
          name: item.name,
          city: item.city,
          country: item.country,
          thumbnail: item.thumbnail,
          rating: 'rating' in item ? item.rating : null,
          price: 'pricePerNight' in item ? item.pricePerNight : 'ticketPrice' in item ? item.ticketPrice : null,
          currency: 'currency' in item ? item.currency : null,
          priceRange: 'priceRange' in item ? item.priceRange : null,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    return NextResponse.json({
      favorites: items,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error) {
    logger.error('GET /api/favorites error:', error);
    return NextResponse.json({ error: 'Failed to load favorites' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const limited = await checkRateLimit(request, 'search');
  if (limited) {return limited;}

  const guard = await requireUser();
  if ('response' in guard) {return guard.response;}
  const { userId } = guard;

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    const exists = await prisma[body.itemType].findUnique({ where: { id: body.itemId }, select: { id: true } });
    if (!exists) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    await prisma.favorite.upsert({
      where: { userId_itemId_itemType: { userId, itemId: body.itemId, itemType: body.itemType } },
      update: {},
      create: {
        userId,
        itemId: body.itemId,
        itemType: body.itemType,
        [fkField(body.itemType)]: body.itemId,
      },
    });

    return NextResponse.json({ success: true, isFavorited: true });
  } catch (error) {
    logger.error('POST /api/favorites error:', error);
    return NextResponse.json({ error: 'Failed to save favorite' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const guard = await requireUser();
  if ('response' in guard) {return guard.response;}
  const { userId } = guard;

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    await prisma.favorite.deleteMany({
      where: { userId, itemId: body.itemId, itemType: body.itemType },
    });
    return NextResponse.json({ success: true, isFavorited: false });
  } catch (error) {
    logger.error('DELETE /api/favorites error:', error);
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
  }
}
