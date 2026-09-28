// src/app/api/ai/travel/route.ts
// 🧠 Logy AI — Global Multilingual Travel Assistant

import { NextRequest, NextResponse } from 'next/server';

import { z } from 'zod';
import { logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';
import { captureException, captureMessage } from '@/lib/monitoring/sentry';
import type { RapidApiHotel } from '@/types/rapidapi';

// SECURITY / COST FIXES
// - Rate limited (this endpoint spends paid Gemini / OpenAI / RapidAPI quota
//   and used to be completely open).
// - Input validated & capped: message length, history length, and roles are
//   restricted to user/assistant (a client could previously inject arbitrary
//   roles / huge histories).
// - The Gemini key travels in a header, not in the URL (URLs end up in logs).
// - Every outbound request has a timeout.
// - LLM-produced search params are validated before reaching RapidAPI.
// - Model names are configurable via env instead of hardcoded, so a
//   deprecated/retired model (Gemini has retired several `-latest` and
//   preview aliases before) doesn't silently take the whole assistant down
//   until someone notices and redeploys.
// - When every provider fails, this is now reported to Sentry instead of
//   only logging locally — previously the user just saw a generic "I am a
//   bit busy" message forever with nobody alerted.

const FETCH_TIMEOUT_MS = 15_000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// One or more comma-separated Gemini model ids, tried in order. Configure
// via GEMINI_MODELS if Google retires/renames a model without notice.
const GEMINI_MODELS = (process.env.GEMINI_MODELS || 'gemini-2.0-flash,gemini-1.5-flash')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const requestSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(4000),
      })
    )
    .max(20)
    .default([]),
});

interface ChatMessage {
  role: string;
  content: string;
}

interface AiResponse {
  message: string;
  action: 'chat' | 'search_hotels';
  searchParams?: {
    destination: string;
    checkIn: string;
    checkOut: string;
    budget?: number;
    guests?: number;
  };
}
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'booking-com15.p.rapidapi.com';

async function searchRealHotels(destination: string, checkIn: string, checkOut: string, budget?: number, guests?: number) {
  if (!RAPIDAPI_KEY) {return [];}
  // Never forward unvalidated model output to a paid API.
  if (!DATE_RE.test(checkIn) || !DATE_RE.test(checkOut) || checkOut <= checkIn) {return [];}
  destination = String(destination).slice(0, 100);
  guests = Math.min(20, Math.max(1, Math.trunc(Number(guests)) || 2));
  budget = Number.isFinite(Number(budget)) && Number(budget) > 0 ? Number(budget) : undefined;
  try {
    const destRes = await fetch(
      `https://${RAPIDAPI_HOST}/api/v1/hotels/searchDestination?query=${encodeURIComponent(destination)}`,
      { headers: { 'X-RapidAPI-Key': RAPIDAPI_KEY, 'X-RapidAPI-Host': RAPIDAPI_HOST }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }
    );
    const destData = await destRes.json();
    if (!destData.data?.length) {return [];}

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
      { headers: { 'X-RapidAPI-Key': RAPIDAPI_KEY, 'X-RapidAPI-Host': RAPIDAPI_HOST }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }
    );
    const hotelsData = await hotelsRes.json();
    if (!hotelsData.data?.hotels) {return [];}

    let hotels = hotelsData.data.hotels.slice(0, 10).map((h: RapidApiHotel) => ({
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

    if (budget) {hotels = hotels.filter((h: { price: number }) => h.price <= budget);}
    return hotels;
  } catch (err) {
    logger.error('Hotel search error:', err);
    return [];
  }
}

export async function POST(request: NextRequest) {
  const limited = await checkRateLimit(request, 'ai');
  if (limited) {return limited;}

  try {
    const parsed = requestSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const { message, history } = parsed.data;

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
    const geminiMessages = messages.map((m: ChatMessage) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }],
    }));

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    let aiText = '{}';
    
    // Try Gemini first, fallback to OpenAI
    let geminiSuccess = false;
    const geminiErrors: string[] = [];

    for (const model of GEMINI_MODELS) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: geminiMessages,
            generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
          }),
        }
      );
      
      if (res.status === 429) {geminiErrors.push(`${model}: rate limited`); continue;}

      const data = await res.json();
      if (data.error) {geminiErrors.push(`${model}: ${data.error?.message || 'unknown error'}`); continue;}

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) { aiText = text; geminiSuccess = true; break; }
      geminiErrors.push(`${model}: empty response`);
    }

    let openAiError: string | undefined;

    // Fallback to OpenAI if Gemini failed
    if (!geminiSuccess && OPENAI_API_KEY) {
      logger.log('Falling back to OpenAI...');
      try {
        const oaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: OPENAI_MODEL,
            max_tokens: 1000,
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages.map((m: ChatMessage) => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
              })),
            ],
          }),
        });
        const oaiData = await oaiRes.json();
        const oaiText = oaiData.choices?.[0]?.message?.content;
        if (oaiText) {aiText = oaiText;}
        else {
          openAiError = oaiData.error?.message || 'empty response';
          logger.error('OpenAI error:', oaiData.error);
        }
      } catch (err) {
        openAiError = err instanceof Error ? err.message : String(err);
        logger.error('OpenAI request failed:', err);
      }
    }

    if (aiText === '{}' || !aiText) {
      // Every configured provider failed (or none are configured beyond the
      // required GEMINI_API_KEY) — this needs a human, not just a log line.
      const summary = [
        `Gemini: ${geminiErrors.length ? geminiErrors.join('; ') : 'no models attempted'}`,
        OPENAI_API_KEY ? `OpenAI: ${openAiError || 'not attempted'}` : 'OpenAI: not configured',
      ].join(' | ');
      logger.error('[ai/travel] All providers failed:', summary);
      captureMessage(`Logy AI: all providers failed — ${summary}`, 'error');

      return NextResponse.json({
        success: true,
        message: 'I am a bit busy. Please try again in a moment! 🙏',
        action: 'chat',
        hotels: [],
        history: [...messages, { role: 'assistant', content: 'busy' }],
      });
    }
    
    const aiText2 = aiText;

    let aiResponse: AiResponse = { message: '', action: 'chat' };
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
    logger.error('AI Travel error:', err);
    captureException(err instanceof Error ? err : new Error(String(err)), { context: 'ai/travel route' });
    return NextResponse.json({
      error: 'AI error',
      message: 'Sorry, an error occurred. Please try again.',
    }, { status: 500 });
  }
}
