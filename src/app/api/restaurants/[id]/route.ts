import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
      include: {
        cityRelation: { select: { id: true, name: true, country: true } },
      },
    });
    if (!restaurant) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(restaurant);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch restaurant' }, { status: 500 });
  }
}
