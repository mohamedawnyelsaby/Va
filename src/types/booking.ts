// src/types/booking.ts
// Shared shapes for the hotel-booking flow (booking page + PaymentFlow),
// built from every field each consumer actually reads — not a full
// duplicate of the Prisma models.

export interface BookingHotelSummary {
  name: string;
  city: string;
  country: string;
  currency?: string;
  pricePerNight?: number;
  roomTypes?: { type: string; price: number }[];
  cityRelation?: { name: string; country: string };
}

export interface Booking {
  id?: string;
  amount?: number;
  currency?: string;
  hotelName?: string;
  itemName?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  nights?: number;
  pricePerNight?: number;
  roomType?: string;
}
