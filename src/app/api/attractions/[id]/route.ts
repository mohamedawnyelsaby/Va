import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const attraction = await prisma.attraction.findUnique({
      where: { id: params.id },
      include: {
        city: { select: { id: true, name: true, country: true } },
      },
    });
    if (!attraction) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(attraction);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch attraction' }, { status: 500 });
  }
}
