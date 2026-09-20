import { describe, it, expect } from 'vitest';
import {
  computeHotelTotal,
  countNights,
  resolveNightlyPrice,
  toPiAmount,
  round2,
} from '@/lib/pricing';

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

  it('falls back to the base price when the hotel has no room list', () => {
    expect(resolveNightlyPrice({ pricePerNight: 120, roomTypes: [] }, 'Standard')).toEqual({
      roomType: 'Standard',
      price: 120,
    });
  });

  it('converts to Pi with an env rate, and 1:1 without one', () => {
    delete process.env.PI_PER_EUR;
    expect(toPiAmount(100, 'EUR')).toBe(100);
    process.env.PI_PER_EUR = '3.5';
    expect(toPiAmount(100, 'eur')).toBe(350);
    expect(toPiAmount(12.5, 'PI')).toBe(12.5);
    delete process.env.PI_PER_EUR;
  });

  it('round2 avoids float noise', () => {
    expect(round2(1.005)).toBe(1.01);
  });
});
