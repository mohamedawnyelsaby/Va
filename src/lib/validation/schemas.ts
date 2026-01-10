// src/lib/validation/schemas.ts
import { z } from 'zod';

// User Schemas
export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
});

export const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

// Booking Schemas
export const createBookingSchema = z.object({
  itemId: z.string().cuid('Invalid item ID'),
  itemType: z.enum(['hotel', 'attraction', 'restaurant', 'service']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  guests: z.number().int().min(1).max(20),
  rooms: z.number().int().min(1).max(10).optional(),
  specialRequests: z.string().max(500).optional(),
});

// Hotel Schemas
export const createHotelSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().min(50).max(5000),
  cityId: z.string().cuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  starRating: z.number().int().min(1).max(5),
  pricePerNight: z.number().min(0),
  amenities: z.array(z.string()),
  images: z.array(z.string().url()),
});

// Review Schemas
export const createReviewSchema = z.object({
  itemId: z.string().cuid(),
  itemType: z.enum(['hotel', 'attraction', 'restaurant']),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3).max(100).optional(),
  comment: z.string().min(10).max(2000),
  images: z.array(z.string().url()).max(5).optional(),
});

// Payment Schemas
export const createPaymentSchema = z.object({
  bookingId: z.string().cuid(),
  amount: z.number().min(0),
  currency: z.string().length(3),
  paymentMethod: z.enum(['credit_card', 'pi_network', 'paypal']),
  piAmount: z.number().min(0).optional(),
});

// Query Schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const searchSchema = paginationSchema.extend({
  search: z.string().max(200).optional(),
  cityId: z.string().cuid().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
});

// Type exports
export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CreateHotelInput = z.infer<typeof createHotelSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
