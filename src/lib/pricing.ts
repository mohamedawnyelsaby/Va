// src/lib/pricing.ts
// Single source of truth for prices. The server computes every amount; the
// client only displays what the server returns. Nothing here trusts client
// input.

import { logger } from '@/lib/logger';

export const TAX_RATE = 0.1; // 10% — same value the booking page used to display
export const CASHBACK_RATE = 0.02; // 2% Pi cashback

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Pi supports up to 7 decimal places. */
export function roundPi(n: number): number {
  return Math.round((n + Number.EPSILON) * 1e7) / 1e7;
}

export function countNights(start: Date, end: Date): number {
  const nights = Math.ceil((end.getTime() - start.getTime()) / 86_400_000);
  return Math.max(1, nights);
}

export interface RoomType {
  type: string;
  price: number;
}

/**
 * Resolves the nightly price for a hotel.
 * - roomType given and found  -> that room's price
 * - roomType given, not found -> throws (tampered / stale request),
 *   except the default placeholder 'Standard' which maps to the first room
 * - no roomType / no rooms    -> hotel.pricePerNight
 */
export function resolveNightlyPrice(
  hotel: { pricePerNight: number; roomTypes: unknown[] },
  roomType?: string
): { roomType: string; price: number } {
  const rooms = (hotel.roomTypes ?? []).filter(
    (r): r is RoomType =>
      typeof r === 'object' &&
      r !== null &&
      typeof (r as RoomType).type === 'string' &&
      typeof (r as RoomType).price === 'number' &&
      (r as RoomType).price > 0
  );

  if (roomType && rooms.length > 0) {
    const match = rooms.find((r) => r.type === roomType);
    if (match) {return { roomType: match.type, price: match.price };}
    // The booking page sends the placeholder 'Standard' when the user did not
    // pick a room; that means "the first listed room" (previous behaviour).
    if (roomType === 'Standard') {return { roomType: rooms[0].type, price: rooms[0].price };}
    throw new Error('UNKNOWN_ROOM_TYPE');
  }
  return { roomType: roomType || 'Standard', price: hotel.pricePerNight };
}

export function computeHotelTotal(params: {
  nightlyPrice: number;
  nights: number;
  rooms: number;
}): number {
  const subtotal = params.nightlyPrice * params.nights * params.rooms;
  return round2(subtotal * (1 + TAX_RATE));
}

const warnedRates = new Set<string>();

/**
 * Converts a fiat amount to Pi.
 * Rate comes from env `PI_PER_<CURRENCY>` = how many Pi equal 1 unit of that
 * currency (e.g. PI_PER_USD=3.1416).
 *
 * SECURITY: a missing/invalid rate used to silently fall back to 1:1, which
 * would charge or credit the wrong amount of real Pi for a JPY or EUR
 * booking. In production this now throws instead — better to fail the
 * request than move real money at the wrong rate. In development, 1:1 is
 * used so local work doesn't require every rate to be configured, with a
 * one-time warning per currency.
 */
export function toPiAmount(amount: number, currency: string): number {
  const cur = (currency || 'USD').toUpperCase();
  if (cur === 'PI') {return roundPi(amount);}

  const raw = process.env[`PI_PER_${cur}`];
  const rate = raw ? Number(raw) : NaN;

  if (Number.isFinite(rate) && rate > 0) {
    return roundPi(amount * rate);
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      `PI_PER_${cur} is not configured. Refusing to charge/credit Pi using an ` +
        'unconfigured conversion rate.'
    );
  }

  if (!warnedRates.has(cur)) {
    warnedRates.add(cur);
    logger.warn(
      `[pricing] PI_PER_${cur} is not set — using 1 ${cur} = 1 Pi for local development. ` +
        'Set PI_PER_<CURRENCY> in the environment before deploying.'
    );
  }
  return roundPi(amount);
}
