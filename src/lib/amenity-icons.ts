// src/lib/amenity-icons.ts
//
// Maps a free-text amenity name ("Free WiFi", "Pool", "Reception 24h", ...) to
// an icon. The hotel page used to look names up in a 5-entry exact-match table:
// "Pool" got a coffee cup, and anything unknown (Spa, Bar, ...) fell back to
// the Wi-Fi icon, so a spa showed a Wi-Fi symbol. Matching is keyword based so
// the many ways data can spell an amenity all resolve, and unknown amenities
// get a neutral checkmark instead of a misleading icon.

import {
  Accessibility,
  Baby,
  Bath,
  Briefcase,
  Bus,
  Check,
  ChefHat,
  Coffee,
  ConciergeBell,
  Dumbbell,
  Martini,
  ParkingCircle,
  PawPrint,
  Shirt,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Tv,
  Umbrella,
  Utensils,
  Waves,
  Wifi,
  type LucideIcon,
} from 'lucide-react';

// Order matters: the first matching rule wins (e.g. "front desk" must hit the
// reception rule before the generic "desk"/business rule).
const RULES: ReadonlyArray<readonly [RegExp, LucideIcon]> = [
  [/\bwi-?fi\b|internet|wireless/, Wifi],
  [/\bpool\b|swim/, Waves],
  [/\bspa\b|wellness|massage|sauna|steam room/, Sparkles],
  [/\bgym\b|fitness|workout/, Dumbbell],
  [/restaurant|dining|buffet/, Utensils],
  [/\bbar\b|lounge|cocktail|\bpub\b/, Martini],
  [/breakfast|coffee|caf[eé]|\btea\b/, Coffee],
  [/\bparking\b|valet|garage/, ParkingCircle],
  [/shuttle|transfer|airport|transport/, Bus],
  [/reception|front desk|concierge|room service|\b24 ?(h|hr|hours?)\b/, ConciergeBell],
  [/air ?con|a\/c|\bac\b|cooling|climate/, Snowflake],
  [/\btv\b|television|cable/, Tv],
  [/laundry|\biron|dry ?clean|washing/, Shirt],
  [/kitchen|cooking/, ChefHat],
  [/\bpets?\b|\bdogs?\b/, PawPrint],
  [/business|meeting|conference|work ?space|\bdesk\b/, Briefcase],
  [/\bkids?\b|child|\bbaby\b|family|nursery|playground/, Baby],
  [/accessib|wheelchair|disab/, Accessibility],
  [/beach|sea ?view|ocean/, Umbrella],
  [/\bbath|jacuzzi|hot ?tub/, Bath],
  [/\bsafe\b|security|cctv/, ShieldCheck],
];

export function getAmenityIcon(name: string | null | undefined): LucideIcon {
  const key = (name ?? '').toLowerCase().trim();
  if (!key) {return Check;}
  for (const [pattern, icon] of RULES) {
    if (pattern.test(key)) {return icon;}
  }
  return Check;
}
