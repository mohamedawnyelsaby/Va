// src/app/api/seed/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import { logger } from '@/lib/logger';
export async function POST(request: Request) {
  try {
    // --------------------------------------------------------------
    // SECURITY: this endpoint used to check the request body against
    // a secret ('Va-Travel-Seed-2026-Secret') that was hardcoded in
    // source and committed to a PUBLIC repo — anyone reading the repo
    // could call this route. It also unconditionally created an
    // admin@vatravel.com account with the password "password123",
    // so a single unauthenticated POST could hand out an admin login.
    // Fixed by: (1) disabling the route entirely outside local/dev
    // environments, (2) reading the secret from an env var instead of
    // hardcoding it, comparing it with a timing-safe check, and
    // (3) generating a random admin password instead of a known one.
    // --------------------------------------------------------------
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PROD_SEED !== 'true') {
      return NextResponse.json(
        { error: 'Seeding is disabled in production' },
        { status: 403 }
      );
    }

    const seedSecret = process.env.SEED_SECRET;
    if (!seedSecret) {
      return NextResponse.json(
        { error: 'SEED_SECRET is not configured on the server' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const providedSecret: string = body?.secret ?? '';

    const provided = Buffer.from(providedSecret);
    const expected = Buffer.from(seedSecret);
    const isValid =
      provided.length === expected.length &&
      crypto.timingSafeEqual(provided, expected);

    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if already seeded
    const existingCities = await prisma.city.count();
    if (existingCities > 0) {
      return NextResponse.json({ 
        message: 'Database already has data',
        cities: existingCities, 
      });
    }

    logger.log('🌱 Starting seed...');

    // Create Cities
    const cities = await Promise.all([
      prisma.city.create({
        data: {
          name: 'Paris',
          slug: 'paris',
          country: 'France',
          countryCode: 'FR',
          description: 'The City of Light, known for its art, fashion, and culture.',
          latitude: 48.8566,
          longitude: 2.3522,
          timezone: 'Europe/Paris',
          currency: 'EUR',
          language: 'fr',
          isPopular: true,
          images: [
            'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
            'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f',
          ],
          thumbnail: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400',
        },
      }),
      prisma.city.create({
        data: {
          name: 'Dubai',
          slug: 'dubai',
          country: 'United Arab Emirates',
          countryCode: 'AE',
          description: 'A global hub of luxury and innovation.',
          latitude: 25.2048,
          longitude: 55.2708,
          timezone: 'Asia/Dubai',
          currency: 'AED',
          language: 'ar',
          isPopular: true,
          images: ['https://images.unsplash.com/photo-1512453979798-5ea266f8880c'],
          thumbnail: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400',
        },
      }),
      prisma.city.create({
        data: {
          name: 'Tokyo',
          slug: 'tokyo',
          country: 'Japan',
          countryCode: 'JP',
          description: 'Where tradition meets technology.',
          latitude: 35.6762,
          longitude: 139.6503,
          timezone: 'Asia/Tokyo',
          currency: 'JPY',
          language: 'ja',
          isPopular: true,
          images: ['https://images.unsplash.com/photo-1540959733332-eab4deabeeaf'],
          thumbnail: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
        },
      }),
      prisma.city.create({
        data: {
          name: 'New York',
          slug: 'new-york',
          country: 'United States',
          countryCode: 'US',
          description: 'The city that never sleeps.',
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York',
          currency: 'USD',
          language: 'en',
          isPopular: true,
          images: ['https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9'],
          thumbnail: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400',
        },
      }),
    ]);

    logger.log(`✅ Created ${cities.length} cities`);

    // Create Users — random passwords generated per run instead of the
    // previous hardcoded "password123" for every account. Returned once
    // in the response so whoever ran the seed can capture them; never
    // logged or stored anywhere else.
    const adminPassword = crypto.randomBytes(12).toString('base64url');
    const testPassword = crypto.randomBytes(12).toString('base64url');
    const [adminHash, testHash] = await Promise.all([
      bcrypt.hash(adminPassword, 12),
      bcrypt.hash(testPassword, 12),
    ]);
    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: 'admin@vatravel.com',
          password: adminHash,
          name: 'Admin User',
        },
      }),
      prisma.user.create({
        data: {
          email: 'user@vatravel.com',
          password: testHash,
          name: 'Test User',
        },
      }),
    ]);

    logger.log(`✅ Created ${users.length} users`);

    // Create Hotels
    const hotels = [];
    for (const city of cities) {
      // Luxury hotel
      const luxuryHotel = await prisma.hotel.create({
        data: {
          name: `Grand ${city.name} Hotel`,
          description: `Experience luxury in ${city.name}. 5-star amenities, world-class dining.`,
          shortDescription: `Luxury 5-star hotel in ${city.name}`,
          address: `1 Luxury Avenue, ${city.name}`,
          city: city.name,
          cityId: city.id,
          country: city.country,
          latitude: city.latitude + 0.01,
          longitude: city.longitude + 0.01,
          starRating: 5,
          amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Gym'],
          roomTypes: [
            { type: 'Standard', price: 200, beds: 1, guests: 2, size: '30 sqm' },
            { type: 'Deluxe', price: 300, beds: 1, guests: 2, size: '40 sqm' },
            { type: 'Suite', price: 500, beds: 2, guests: 4, size: '60 sqm' },
          ],
          pricePerNight: 200,
          currency: city.currency,
          images: [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945',
            'https://images.unsplash.com/photo-1582719508461-905c673771fd',
          ],
          thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
          isFeatured: true,
          rating: 4.8,
          reviewCount: 1250,
        },
      });
      hotels.push(luxuryHotel);

      // Budget hotel
      const budgetHotel = await prisma.hotel.create({
        data: {
          name: `Budget Inn ${city.name}`,
          description: `Affordable comfort in ${city.name}.`,
          shortDescription: `Budget hotel in ${city.name}`,
          address: `50 Budget Street, ${city.name}`,
          city: city.name,
          cityId: city.id,
          country: city.country,
          latitude: city.latitude - 0.01,
          longitude: city.longitude - 0.01,
          starRating: 3,
          amenities: ['WiFi', 'Breakfast'],
          roomTypes: [
            { type: 'Standard', price: 80, beds: 1, guests: 2, size: '20 sqm' },
          ],
          pricePerNight: 80,
          currency: city.currency,
          images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'],
          thumbnail: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
          rating: 4.2,
          reviewCount: 450,
        },
      });
      hotels.push(budgetHotel);
    }

    logger.log(`✅ Created ${hotels.length} hotels`);

    return NextResponse.json({
      success: true,
      message: '🎉 Database seeded successfully!',
      data: {
        cities: cities.length,
        users: users.length,
        hotels: hotels.length,
        // One-time credentials — save these now, they are not recoverable
        // and are never logged or stored in plaintext anywhere.
        credentials: {
          admin: { email: 'admin@vatravel.com', password: adminPassword },
          testUser: { email: 'user@vatravel.com', password: testPassword },
        },
      },
    });

  } catch (error: any) {
    logger.error('❌ Seed error:', error);
    return NextResponse.json(
      { 
        error: 'Seed failed', 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
