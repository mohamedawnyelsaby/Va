import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  computeHotelTotal,
  countNights,
  resolveNightlyPrice,
  toPiAmount,
  round2,
} from '@/lib/pricing';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('pricing', () => {
  it('counts at least one night and rounds partial days up', () => {
    const d = (s: string) => new Date(s);
    expect(countNights(d('2026-10-01'), d('2026-10-01'))).toBe(1);
    expect(countNights(d('2026-10-01'), d('2026-10-04'))).toBe(3);
    expect(countNights(d('2026-10-01T00:00:00Z'), d('2026-10-02T06:00:00Z'))).toBe(2);
  });

  it('computes nights x rooms plus 10% tax', () => {
    expect(computeHotelTotal({ nightlyPrice: 200, nights: 3, rooms: 2 })).toBe(1320);
    expect(computeHotelTotal({ nightlyPrice: 80, nights: 1, rooms: 1 })).toBe(88);
  });

  it('resolves the requested room price and rejects unknown rooms', () => {
    const hotel = {
      pricePerNight: 200,
      roomTypes: [
        { type: 'Standard', price: 200 },
        { type: 'Suite', price: 500 },
      ],
    };
    expect(resolveNightlyPrice(hotel, 'Suite')).toEqual({ roomType: 'Suite', price: 500 });
    expect(() => resolveNightlyPrice(hotel, 'Penthouse')).toThrow('UNKNOWN_ROOM_TYPE');
  });

  it('passes through totalRooms when a room type declares it, for overbooking checks', () => {
    const hotel = {
      pricePerNight: 200,
      roomTypes: [
        { type: 'Standard', price: 200, totalRooms: 5 },
        { type: 'Suite', price: 500 }, // no totalRooms -> unlimited, as before
      ],
    };
    expect(resolveNightlyPrice(hotel, 'Standard')).toEqual({ roomType: 'Standard', price: 200, totalRooms: 5 });
    expect(resolveNightlyPrice(hotel, 'Suite')).toEqual({ roomType: 'Suite', price: 500 });
  });

  it("maps the default 'Standard' placeholder to the first listed room", () => {
    const hotel = { pricePerNight: 300, roomTypes: [{ type: 'Deluxe', price: 300 }] };
    expect(resolveNightlyPrice(hotel, 'Standard')).toEqual({ roomType: 'Deluxe', price: 300 });
  });

  it('falls back to the base price when the hotel has no room list', () => {
    expect(resolveNightlyPrice({ pricePerNight: 120, roomTypes: [] }, 'Standard')).toEqual({
      roomType: 'Standard',
      price: 120,
    });
  });

  it('converts to Pi with an env rate, and 1:1 in development without one', () => {
    delete process.env.PI_PER_EUR;
    expect(toPiAmount(100, 'EUR')).toBe(100);
    process.env.PI_PER_EUR = '3.5';
    expect(toPiAmount(100, 'eur')).toBe(350);
    expect(toPiAmount(12.5, 'PI')).toBe(12.5);
    delete process.env.PI_PER_EUR;
  });

  it('refuses to charge/credit Pi in production with no configured rate', () => {
    delete process.env.PI_PER_GBP;
    vi.stubEnv('NODE_ENV', 'production');
    expect(() => toPiAmount(100, 'GBP')).toThrow(/PI_PER_GBP/);
  });

  it('still converts correctly in production when the rate IS configured', () => {
    vi.stubEnv('NODE_ENV', 'production');
    process.env.PI_PER_GBP = '4';
    try {
      expect(toPiAmount(50, 'GBP')).toBe(200);
    } finally {
      delete process.env.PI_PER_GBP;
    }
  });

  it('round2 avoids float noise', () => {
    expect(round2(1.005)).toBe(1.01);
  });
});
