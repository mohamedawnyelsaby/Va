import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
    });
    if (!restaurant) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(restaurant);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
