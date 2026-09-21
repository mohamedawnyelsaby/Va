// src/app/api/hotels/search/route.ts
// Real hotels from Booking.com via RapidAPI

import { NextRequest, NextResponse } from 'next/server';
import type { RapidApiHotel } from '@/types/rapidapi';

import { logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';
import { clampInt } from '@/lib/api-utils';

// FIXES: rate limited (paid RapidAPI quota), inputs validated instead of
// being forwarded blindly, request timeouts, internal error text no longer
// returned to the client.
const FETCH_TIMEOUT_MS = 15_000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'booking-com15.p.rapidapi.com';

export async function GET(request: NextRequest) {
  const limited = await checkRateLimit(request, 'search');
  if (limited) {return limited;}

  const { searchParams } = new URL(request.url);

  const destination = (searchParams.get('destination') || 'Dubai').trim().slice(0, 100);
  const checkIn = searchParams.get('checkIn') || getTomorrow();
  const checkOut = searchParams.get('checkOut') || getDayAfter();
  const adults = String(clampInt(searchParams.get('adults'), 1, 1, 20));
  const rooms = String(clampInt(searchParams.get('rooms'), 1, 1, 10));

  if (!destination) {
    return NextResponse.json({ error: 'Destination is required', hotels: [] }, { status: 400 });
  }
  if (!DATE_RE.test(checkIn) || !DATE_RE.test(checkOut) || checkOut <= checkIn) {
    return NextResponse.json({ error: 'Invalid dates', hotels: [] }, { status: 400 });
  }

  if (!RAPIDAPI_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    // Step 1: Get destination ID
    logger.log(`🔍 Searching destination: ${destination}`);
    
    const destRes = await fetch(
      `https://${RAPIDAPI_HOST}/api/v1/hotels/searchDestination?query=${encodeURIComponent(destination)}`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      }
    );

    const destData = await destRes.json();
    
    if (!destData.data || destData.data.length === 0) {
      return NextResponse.json({ error: 'Destination not found', hotels: [] });
    }

    const destId = destData.data[0].dest_id;
    const destType = destData.data[0].dest_type;
    
    logger.log(`✅ Destination found: ${destId} (${destType})`);

    // Step 2: Search hotels
    const hotelsRes = await fetch(
      `https://${RAPIDAPI_HOST}/api/v1/hotels/searchHotels?` +
      new URLSearchParams({
        dest_id: destId,
        search_type: destType,
        arrival_date: checkIn,
        departure_date: checkOut,
        adults: adults,
        room_qty: rooms,
        units: 'metric',
        temperature_unit: 'c',
        languagecode: 'en-us',
        currency_code: 'USD',
      }),
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      }
    );

    const hotelsData = await hotelsRes.json();

    if (!hotelsData.data || !hotelsData.data.hotels) {
      return NextResponse.json({ 
        error: 'No hotels found',
        hotels: [],
        destination,
      });
    }

    // Format hotels
    const hotels = hotelsData.data.hotels.slice(0, 20).map((hotel: RapidApiHotel) => ({
      id: hotel.hotel_id?.toString(),
      name: hotel.property?.name,
      city: destination,
      country: hotel.property?.countryCode,
      address: hotel.property?.wishlistName,
      latitude: hotel.property?.latitude,
      longitude: hotel.property?.longitude,
      starRating: hotel.property?.propertyClass,
      rating: hotel.property?.reviewScore,
      reviewCount: hotel.property?.reviewCount,
      reviewText: hotel.property?.reviewScoreWord,
      pricePerNight: hotel.property?.priceBreakdown?.grossPrice?.value,
      currency: hotel.property?.priceBreakdown?.grossPrice?.currency || 'USD',
      thumbnail: hotel.property?.photoUrls?.[0],
      images: hotel.property?.photoUrls || [],
      isFeatured: (hotel.property?.reviewScore ?? 0) > 8.5,
      checkIn,
      checkOut,
      source: 'booking.com',
    }));

    logger.log(`✅ Found ${hotels.length} hotels in ${destination}`);

    return NextResponse.json({
      success: true,
      destination,
      checkIn,
      checkOut,
      hotels,
      total: hotels.length,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Hotels search error:', msg);
    return NextResponse.json({ error: 'Hotel search failed', hotels: [] }, { status: 502 });
  }
}

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function getDayAfter(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().split('T')[0];
}
