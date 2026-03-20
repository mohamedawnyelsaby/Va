// src/app/api/ai/travel/route.ts
// 🧠 Logy AI — Global Multilingual Travel Assistant

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

    const today = new Date().toISOString().split('T')[0];
    const messages = [...history, { role: 'user', content: message }];

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'AI not configured', message: 'AI service not available' }, { status: 500 });
    }

    const systemPrompt = `You are Logy AI — the world's most advanced AI travel assistant, powered by Pi Network.

🌍 CRITICAL RULE: ALWAYS respond in the EXACT same language the user writes in.
- User writes in Arabic → respond in Arabic
- User writes in English → respond in English  
- User writes in French → respond in French
- User writes in Spanish → respond in Spanish
- User writes in any language → respond in THAT language

Your role: Help users find and book hotels worldwide autonomously.
Today's date: ${today}

When user mentions travel/hotels, extract destination, dates, budget.

ALWAYS respond in this EXACT JSON format (no markdown, no backticks):
{"message":"your response in USER's language","action":"search_hotels","searchParams":{"destination":"English city name","checkIn":"YYYY-MM-DD","checkOut":"YYYY-MM-DD","budget":300,"guests":2}}

If just chatting: {"message":"response","action":"chat"}
If missing dates, ask in user's language: {"message":"ask for dates","action":"chat"}`;

    // Build Gemini messages
    const geminiMessages = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }]
    }));

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    let aiText = '{}';
    
    // Try Gemini first, fallback to OpenAI
    let geminiSuccess = false;
    
    const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];
    for (const model of models) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: geminiMessages,
            generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
          }),
        }
      );
      
      if (res.status === 429) continue;
      
      const data = await res.json();
      if (data.error) continue;
      
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) { aiText = text; geminiSuccess = true; break; }
    }
    
    // Fallback to OpenAI if Gemini failed
    if (!geminiSuccess && OPENAI_API_KEY) {
      console.log('Falling back to OpenAI...');
      const oaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 1000,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map((m: any) => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
            })),
          ],
        }),
      });
      const oaiData = await oaiRes.json();
      const oaiText = oaiData.choices?.[0]?.message?.content;
      if (oaiText) aiText = oaiText;
      else console.error('OpenAI error:', oaiData.error);
    }
    
    if (aiText === '{}' || !aiText) {
      return NextResponse.json({
        success: true,
        message: 'I am a bit busy. Please try again in a moment! 🙏',
        action: 'chat',
        hotels: [],
        history: [...messages, { role: 'assistant', content: 'busy' }],
      });
    }
    
    const aiText2 = aiText;

    let aiResponse: any = {};
    try {
      const jsonMatch = aiText2.match(/\{[\s\S]*\}/);
      aiResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : { message: aiText2, action: 'chat' };
    } catch {
      aiResponse = { message: aiText2, action: 'chat' };
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
