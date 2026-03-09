import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const attraction = await prisma.attraction.findUnique({
      where: { id },
    });
    if (!attraction) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(attraction);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
