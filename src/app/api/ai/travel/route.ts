// src/app/api/ai/travel/route.ts
// 🧠 Va Travel AI — Global Multilingual Assistant

import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'booking-com15.p.rapidapi.com';

async function searchRealHotels(destination: string, checkIn: string, checkOut: string, budget?: number, guests?: number) {
  if (!RAPIDAPI_KEY) return [];
  try {
    const destRes = await fetch(
      `https://${RAPIDAPI_HOST}/api/v1/hotels/searchDestination?query=${encodeURIComponent(destination)}`,
      { headers: { 'X-RapidAPI-Key': RAPIDAPI_KEY, 'X-RapidAPI-Host': RAPIDAPI_HOST } }
    );
    const destData = await destRes.json();
    if (!destData.data?.length) return [];

    const destId = destData.data[0].dest_id;
    const destType = destData.data[0].dest_type;

    const hotelsRes = await fetch(
      `https://${RAPIDAPI_HOST}/api/v1/hotels/searchHotels?` +
      new URLSearchParams({
        dest_id: destId,
        search_type: destType,
        arrival_date: checkIn,
        departure_date: checkOut,
        adults: String(guests || 2),
        room_qty: '1',
        currency_code: 'USD',
        languagecode: 'en-us',
      }),
      { headers: { 'X-RapidAPI-Key': RAPIDAPI_KEY, 'X-RapidAPI-Host': RAPIDAPI_HOST } }
    );
    const hotelsData = await hotelsRes.json();
    if (!hotelsData.data?.hotels) return [];

    let hotels = hotelsData.data.hotels.slice(0, 10).map((h: any) => ({
      id: h.hotel_id?.toString(),
      name: h.property?.name,
      rating: h.property?.reviewScore,
      reviewText: h.property?.reviewScoreWord,
      reviewCount: h.property?.reviewCount,
      stars: h.property?.propertyClass,
      price: Math.round(h.property?.priceBreakdown?.grossPrice?.value || 0),
      currency: 'USD',
      thumbnail: h.property?.photoUrls?.[0],
      city: destination,
      source: 'booking.com',
      checkIn,
      checkOut,
    }));

    if (budget) hotels = hotels.filter((h: any) => h.price <= budget);
    return hotels;
  } catch (err) {
    console.error('Hotel search error:', err);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = body;

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 500 });
    }

    const today = new Date().toISOString().split('T')[0];
    const messages = [...history, { role: 'user', content: message }];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: `You are Va Travel AI — the world's most advanced AI travel assistant, powered by Pi Network.

🌍 CRITICAL RULE: ALWAYS respond in the EXACT same language the user writes in.
- User writes in Arabic → respond in Arabic
- User writes in English → respond in English  
- User writes in French → respond in French
- User writes in Spanish → respond in Spanish
- User writes in Chinese → respond in Chinese
- User writes in any language → respond in THAT language
Never switch languages unless the user does.

Your role: Help users find and book hotels worldwide. You handle EVERYTHING autonomously:
- Find best hotels from Booking.com worldwide
- Compare prices and ratings
- Complete bookings with Pi Network or USD payment
- Solve any travel problem instantly
- 24/7 customer support

Today's date: ${today}

When user mentions travel/hotels, extract:
- destination (city name in English for API)
- checkIn (YYYY-MM-DD)
- checkOut (YYYY-MM-DD)  
- budget (USD per night, optional)
- guests (number, optional)

ALWAYS respond in this exact JSON format:
{
  "message": "your response in USER'S language — friendly, helpful, expert",
  "action": "search_hotels" | "chat" | "show_booking",
  "searchParams": {
    "destination": "English city name",
    "checkIn": "YYYY-MM-DD",
    "checkOut": "YYYY-MM-DD",
    "budget": 300,
    "guests": 2
  }
}

If missing dates, ask for them in user's language before searching.
Be warm, professional, and efficient. You are the best travel agent in the world.`,
        messages,
      }),
    });

    const aiData = await response.json();
    const aiText = aiData.content?.[0]?.text || '{}';

    let aiResponse: any = {};
    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      aiResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : { message: aiText, action: 'chat' };
    } catch {
      aiResponse = { message: aiText, action: 'chat' };
    }

    // Search hotels if needed
    let hotels = [];
    if (aiResponse.action === 'search_hotels' && aiResponse.searchParams) {
      const { destination, checkIn, checkOut, budget, guests } = aiResponse.searchParams;
      if (destination && checkIn && checkOut) {
        hotels = await searchRealHotels(destination, checkIn, checkOut, budget, guests);
      }
    }

    return NextResponse.json({
      success: true,
      message: aiResponse.message,
      action: aiResponse.action,
      searchParams: aiResponse.searchParams,
      hotels,
      history: [...messages, { role: 'assistant', content: JSON.stringify(aiResponse) }],
    });

  } catch (err) {
    console.error('AI Travel error:', err);
    return NextResponse.json({
      error: 'AI error',
      message: 'Sorry, an error occurred. Please try again.',
    }, { status: 500 });
  }
}
