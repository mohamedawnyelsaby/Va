import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!id) {return NextResponse.json({ error: 'Missing id' }, { status: 400 });}
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
    });
    if (!restaurant) {return NextResponse.json({ error: 'Not found' }, { status: 404 });}
    return NextResponse.json(restaurant);
  } catch (error) {
    // FIX: this used to echo `String(error)` — raw internal error text —
    // straight back to any anonymous caller. Logged server-side only now.
    logger.error('Restaurant detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch restaurant' }, { status: 500 });
  }
}
