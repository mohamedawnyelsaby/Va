// src/app/api/seed/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    // Security check
    const body = await request.json();
    const { secret } = body;
    
    // Change this to your own secret!
    if (secret !== 'Va-Travel-Seed-2026-Secret') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if already seeded
    const existingCities = await prisma.city.count();
    if (existingCities > 0) {
      return NextResponse.json({ 
        message: 'Database already has data',
        cities: existingCities 
      });
    }

    console.log('🌱 Starting seed...');

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

    console.log(`✅ Created ${cities.length} cities`);

    // Create Users
    const hashedPassword = await bcrypt.hash('password123', 12);
    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: 'admin@vatravel.com',
          password: hashedPassword,
          name: 'Admin User',
        },
      }),
      prisma.user.create({
        data: {
          email: 'user@vatravel.com',
          password: hashedPassword,
          name: 'Test User',
        },
      }),
    ]);

    console.log(`✅ Created ${users.length} users`);

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

    console.log(`✅ Created ${hotels.length} hotels`);

    return NextResponse.json({
      success: true,
      message: '🎉 Database seeded successfully!',
      data: {
        cities: cities.length,
        users: users.length,
        hotels: hotels.length,
      },
    });

  } catch (error: any) {
    console.error('❌ Seed error:', error);
    return NextResponse.json(
      { 
        error: 'Seed failed', 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
