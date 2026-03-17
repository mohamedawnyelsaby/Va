// src/app/api/payments/pi/test/route.ts
import { NextResponse } from 'next/server';

const PI_API_KEY = process.env.PI_API_KEY;

export async function GET() {
  if (!PI_API_KEY) {
    return NextResponse.json({ error: 'PI_API_KEY not set' }, { status: 500 });
  }

  // Test Pi API key by calling a simple endpoint
  try {
    const res = await fetch('https://api.minepi.com/v2/me', {
      headers: {
        Authorization: `Key ${PI_API_KEY}`,
      },
    });
    const text = await res.text();
    return NextResponse.json({
      piApiStatus: res.status,
      piApiResponse: text.slice(0, 500),
      keyPrefix: PI_API_KEY.substring(0, 8) + '...',
      sandbox: process.env.NEXT_PUBLIC_PI_SANDBOX,
    });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'unknown',
      keyPrefix: PI_API_KEY.substring(0, 8) + '...',
    });
  }
}
