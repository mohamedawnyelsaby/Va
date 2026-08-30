// src/types/rapidapi.ts
// Shape of a hotel object as RapidAPI's Booking.com endpoint returns
// it. Covers the fields read across both places that call this API
// (hotels/search/route.ts and ai/travel/route.ts) — not the full
// upstream response, which has many more fields we don't use.

export interface RapidApiHotel {
  hotel_id?: number | string;
  property?: {
    name?: string;
    countryCode?: string;
    wishlistName?: string;
    latitude?: number;
    longitude?: number;
    propertyClass?: number;
    reviewScore?: number;
    reviewCount?: number;
    reviewScoreWord?: string;
    priceBreakdown?: { grossPrice?: { value?: number; currency?: string } };
    photoUrls?: string[];
  };
}
