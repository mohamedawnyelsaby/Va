// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { Check, ConciergeBell, Coffee, Dumbbell, Martini, Sparkles, Utensils, Waves, Wifi } from 'lucide-react';
import { getAmenityIcon } from '@/lib/amenity-icons';

describe('getAmenityIcon', () => {
  it.each([
    // the exact values the production seed uses
    ['WiFi', Wifi],
    ['Pool', Waves], // used to be a coffee cup
    ['Spa', Sparkles], // used to fall back to the Wi-Fi icon
    ['Restaurant', Utensils],
    ['Bar', Martini], // used to fall back to the Wi-Fi icon
    ['Gym', Dumbbell],
    ['Breakfast', Coffee],
    // other spellings found in the data
    ['Free WiFi', Wifi],
    ['Reception 24h', ConciergeBell],
    ['Swimming pool', Waves],
    ['Fitness Center', Dumbbell],
    ['Wi-Fi', Wifi],
  ])('%s -> the right icon', (name, icon) => {
    expect(getAmenityIcon(name)).toBe(icon);
  });

  it('is case/whitespace insensitive', () => {
    expect(getAmenityIcon('  POOL ')).toBe(Waves);
  });

  it('does not match inside unrelated words', () => {
    expect(getAmenityIcon('Free space')).toBe(Check); // not "spa"
    expect(getAmenityIcon('Carpet')).toBe(Check); // not "pet"
    expect(getAmenityIcon('Steamed buns')).toBe(Check); // not "tea"
    expect(getAmenityIcon('Barbecue')).toBe(Check); // not "bar"
  });

  it('gives a neutral checkmark, never a misleading icon, for unknown or empty names', () => {
    expect(getAmenityIcon('Helipad')).toBe(Check);
    expect(getAmenityIcon('')).toBe(Check);
    expect(getAmenityIcon(undefined)).toBe(Check);
    expect(getAmenityIcon(null)).toBe(Check);
  });

  it('"front desk" resolves to reception, not the generic business/desk rule', () => {
    expect(getAmenityIcon('Front desk')).toBe(ConciergeBell);
  });
});
