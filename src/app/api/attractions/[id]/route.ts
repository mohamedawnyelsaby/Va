import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!id) {return NextResponse.json({ error: 'Missing id' }, { status: 400 });}
    const attraction = await prisma.attraction.findUnique({
      where: { id },
    });
    if (!attraction) {return NextResponse.json({ error: 'Not found' }, { status: 404 });}
    return NextResponse.json(attraction);
  } catch (error) {
    // FIX: this used to echo `String(error)` — raw internal error text
    // (database errors, stack info) — straight back to any anonymous
    // caller. Now logged server-side only, generic message to the client.
    logger.error('Attraction detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch attraction' }, { status: 500 });
  }
}
