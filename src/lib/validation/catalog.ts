// src/lib/validation/catalog.ts
// Zod schemas for admin-managed catalog data (hotels, attractions,
// restaurants, cities). `rating` and `reviewCount` are intentionally NOT
// accepted from the client: they are derived from real reviews.

import { z } from 'zod';

const httpsUrl = z
  .string()
  .url()
  .max(2048)
  .refine((u) => u.startsWith('https://'), 'URL must use https');

const idString = z.string().min(1).max(64);
const shortText = (max: number) => z.string().trim().min(1).max(max);

export const hotelBaseSchema = z.object({
  name: shortText(200),
  description: shortText(10_000),
  shortDescription: z.string().trim().max(500).optional(),
  address: shortText(300),
  city: shortText(100),
  cityId: idString,
  country: shortText(100),
  postalCode: z.string().trim().max(20).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  starRating: z.number().int().min(1).max(5),
  amenities: z.array(z.string().trim().min(1).max(100)).max(100).optional(),
  roomTypes: z
    .array(
      z.object({
        type: shortText(100),
        price: z.number().positive().max(1_000_000),
        beds: z.number().int().min(1).max(20).optional(),
        guests: z.number().int().min(1).max(50).optional(),
        size: z.string().max(50).optional(),
      })
    )
    .max(50)
    .optional(),
  pricePerNight: z.number().positive().max(1_000_000),
  currency: z.string().trim().length(3).toUpperCase(),
  images: z.array(httpsUrl).max(50).optional(),
  thumbnail: httpsUrl.optional(),
  isFeatured: z.boolean().optional(),
  discountRate: z.number().int().min(0).max(100).optional(),
});
export const hotelCreateSchema = hotelBaseSchema;
export const hotelUpdateSchema = hotelBaseSchema.omit({ cityId: true }).partial();

export const attractionBaseSchema = z.object({
  cityId: idString,
  name: shortText(200),
  description: shortText(10_000),
  shortDescription: z.string().trim().max(500).optional(),
  category: shortText(100),
  subcategory: z.string().trim().max(100).optional(),
  address: shortText(300),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  ticketPrice: z.number().min(0).max(1_000_000),
  currency: z.string().trim().length(3).toUpperCase().optional(),
  openingHours: z.record(z.unknown()).optional(),
  duration: z.string().trim().max(100).optional(),
  accessibility: z.array(z.string().trim().min(1).max(100)).max(50).optional(),
  images: z.array(httpsUrl).max(50).optional(),
  thumbnail: httpsUrl.optional(),
  isPopular: z.boolean().optional(),
});

export const restaurantBaseSchema = z.object({
  cityId: idString,
  name: shortText(200),
  description: shortText(10_000),
  cuisine: z.array(z.string().trim().min(1).max(50)).min(1).max(20),
  priceRange: shortText(20),
  address: shortText(300),
  city: shortText(100),
  country: shortText(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  openingHours: z.record(z.unknown()).optional(),
  reservationRequired: z.boolean().optional(),
  dressCode: z.string().trim().max(100).optional(),
  features: z.array(z.string().trim().min(1).max(100)).max(50).optional(),
  images: z.array(httpsUrl).max(50).optional(),
  thumbnail: httpsUrl.optional(),
  isFeatured: z.boolean().optional(),
});

export const citySchema = z.object({
  name: shortText(100),
  country: shortText(100),
  countryCode: z.string().trim().length(2).toUpperCase(),
  description: z.string().trim().max(5000).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: shortText(64),
  currency: z.string().trim().length(3).toUpperCase().optional(),
  language: z.string().trim().min(2).max(10).optional(),
  isPopular: z.boolean().optional(),
  images: z.array(httpsUrl).max(50).optional(),
  thumbnail: httpsUrl.optional(),
});
