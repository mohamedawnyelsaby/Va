// prisma/seed.ts
// ✅ SIMPLIFIED SEED FILE - Only creates data for existing models

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // ========================================
  // 1. CREATE CITIES
  // ========================================
  console.log('📍 Creating cities...');
  
  const cities = await Promise.all([
    prisma.city.create({
      data: {
        name: 'Paris',
        slug: 'paris',
        country: 'France',
        countryCode: 'FR',
        description: 'The City of Light, known for its art, fashion, gastronomy, and culture.',
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
        description: 'A global hub of luxury, innovation, and Arabian hospitality.',
        latitude: 25.2048,
        longitude: 55.2708,
        timezone: 'Asia/Dubai',
        currency: 'AED',
        language: 'ar',
        isPopular: true,
        images: [
          'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
          'https://images.unsplash.com/photo-1518684079-3c830dcef090',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400',
      },
    }),
    prisma.city.create({
      data: {
        name: 'Tokyo',
        slug: 'tokyo',
        country: 'Japan',
        countryCode: 'JP',
        description: 'Where ancient tradition meets cutting-edge technology.',
        latitude: 35.6762,
        longitude: 139.6503,
        timezone: 'Asia/Tokyo',
        currency: 'JPY',
        language: 'ja',
        isPopular: true,
        images: [
          'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
          'https://images.unsplash.com/photo-1513407030348-c983a97b98d8',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
      },
    }),
    prisma.city.create({
      data: {
        name: 'New York',
        slug: 'new-york',
        country: 'United States',
        countryCode: 'US',
        description: 'The city that never sleeps, offering endless entertainment.',
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
    prisma.city.create({
      data: {
        name: 'London',
        slug: 'london',
        country: 'United Kingdom',
        countryCode: 'GB',
        description: 'A historic capital blending tradition with modern culture.',
        latitude: 51.5074,
        longitude: -0.1278,
        timezone: 'Europe/London',
        currency: 'GBP',
        language: 'en',
        isPopular: true,
        images: ['https://images.unsplash.com/photo-1513635269975-59663e0ac1ad'],
        thumbnail: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400',
      },
    }),
  ]);

  console.log(`✅ Created ${cities.length} cities`);

  // ========================================
  // 2. CREATE TEST USERS
  // ========================================
  console.log('👤 Creating users...');

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
    prisma.user.create({
      data: {
        email: 'demo@vatravel.com',
        password: hashedPassword,
        name: 'Demo User',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // ========================================
  // 3. CREATE HOTELS
  // ========================================
  console.log('🏨 Creating hotels...');

  const hotels = [];
  for (const city of cities) {
    // Luxury hotel
    const luxuryHotel = await prisma.hotel.create({
      data: {
        name: `Grand ${city.name} Hotel`,
        description: `Experience unparalleled luxury in the heart of ${city.name}. Our 5-star hotel offers world-class amenities, michelin-starred dining, and breathtaking views of the city's most iconic landmarks.`,
        shortDescription: `Luxury 5-star hotel in ${city.name}`,
        address: `1 Luxury Avenue, ${city.name}`,
        city: city.name,
        cityId: city.id,
        country: city.country,
        latitude: city.latitude + 0.01,
        longitude: city.longitude + 0.01,
        starRating: 5,
        amenities: [
          'Free WiFi',
          'Swimming Pool',
          'Fitness Center',
          'Spa & Wellness',
          'Restaurant',
          'Bar',
          'Room Service',
          'Concierge',
          'Valet Parking',
          'Airport Shuttle',
        ],
        roomTypes: [
          { type: 'Standard', price: 200, beds: 1, guests: 2, size: '30 sqm' },
          { type: 'Deluxe', price: 300, beds: 1, guests: 2, size: '40 sqm' },
          { type: 'Suite', price: 500, beds: 2, guests: 4, size: '60 sqm' },
          { type: 'Presidential', price: 1000, beds: 3, guests: 6, size: '120 sqm' },
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
        description: `Affordable comfort in the heart of ${city.name}. Perfect for budget-conscious travelers who don't want to compromise on location.`,
        shortDescription: `Affordable hotel in ${city.name}`,
        address: `50 Budget Street, ${city.name}`,
        city: city.name,
        cityId: city.id,
        country: city.country,
        latitude: city.latitude - 0.01,
        longitude: city.longitude - 0.01,
        starRating: 3,
        amenities: ['Free WiFi', 'Breakfast', 'Reception 24h'],
        roomTypes: [
          { type: 'Standard', price: 80, beds: 1, guests: 2, size: '20 sqm' },
          { type: 'Twin', price: 100, beds: 2, guests: 2, size: '25 sqm' },
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

  // ========================================
  // 4. CREATE ATTRACTIONS
  // ========================================
  console.log('🗼 Creating attractions...');

  const attractions = await Promise.all([
    // Paris
    prisma.attraction.create({
      data: {
        name: 'Eiffel Tower',
        description: 'The iconic iron lattice tower, symbol of Paris and France.',
        shortDescription: 'Iconic Paris landmark',
        category: 'Monument',
        subcategory: 'Historical',
        address: 'Champ de Mars, Paris',
        city: 'Paris',
        cityId: cities[0].id,
        country: 'France',
        latitude: 48.8584,
        longitude: 2.2945,
        ticketPrice: 26,
        currency: 'EUR',
        duration: '2-3 hours',
        openingHours: { open: '09:00', close: '23:45' },
        accessibility: [],
        images: ['https://images.unsplash.com/photo-1511739001486-6bfe10ce785f'],
        thumbnail: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400',
        isPopular: true,
        rating: 4.7,
        reviewCount: 5420,
      },
    }),
    // Dubai
    prisma.attraction.create({
      data: {
        name: 'Burj Khalifa',
        description: 'The tallest building in the world with observation decks.',
        shortDescription: 'World\'s tallest building',
        category: 'Skyscraper',
        subcategory: 'Modern',
        address: 'Downtown Dubai',
        city: 'Dubai',
        cityId: cities[1].id,
        country: 'UAE',
        latitude: 25.1972,
        longitude: 55.2744,
        ticketPrice: 149,
        currency: 'AED',
        duration: '1-2 hours',
        accessibility: [],
        images: ['https://images.unsplash.com/photo-1512453979798-5ea266f8880c'],
        thumbnail: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400',
        isPopular: true,
        rating: 4.9,
        reviewCount: 8932,
      },
    }),
    // Tokyo
    prisma.attraction.create({
      data: {
        name: 'Senso-ji Temple',
        description: 'Tokyo\'s oldest and most significant Buddhist temple.',
        shortDescription: 'Historic Buddhist temple',
        category: 'Temple',
        subcategory: 'Religious',
        address: 'Asakusa, Tokyo',
        city: 'Tokyo',
        cityId: cities[2].id,
        country: 'Japan',
        latitude: 35.7148,
        longitude: 139.7967,
        ticketPrice: 0,
        currency: 'JPY',
        duration: '1-2 hours',
        accessibility: [],
        images: ['https://images.unsplash.com/photo-1513407030348-c983a97b98d8'],
        thumbnail: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=400',
        isPopular: true,
        rating: 4.6,
        reviewCount: 3250,
      },
    }),
  ]);

  console.log(`✅ Created ${attractions.length} attractions`);

  // ========================================
  // 5. CREATE RESTAURANTS
  // ========================================
  console.log('🍽️ Creating restaurants...');

  const restaurants = await Promise.all([
    prisma.restaurant.create({
      data: {
        name: 'Le Gourmet Paris',
        description: 'Fine French dining with Michelin-star quality.',
        cuisine: ['French', 'European', 'Fine Dining'],
        priceRange: '$$$$',
        address: 'Champs-Élysées, Paris',
        city: 'Paris',
        cityId: cities[0].id,
        country: 'France',
        latitude: 48.8698,
        longitude: 2.3078,
        openingHours: { lunch: '12:00-15:00', dinner: '19:00-22:30' },
        reservationRequired: true,
        dressCode: 'Smart Casual',
        features: ['Outdoor Seating', 'Wine Bar', 'Private Dining'],
        images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'],
        thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
        isFeatured: true,
        rating: 4.8,
        reviewCount: 892,
      },
    }),
    prisma.restaurant.create({
      data: {
        name: 'Arabian Nights',
        description: 'Authentic Emirati and Middle Eastern cuisine.',
        cuisine: ['Middle Eastern', 'Arabic', 'Lebanese'],
        priceRange: '$$$',
        address: 'Dubai Marina',
        city: 'Dubai',
        cityId: cities[1].id,
        country: 'UAE',
        latitude: 25.0800,
        longitude: 55.1400,
        features: ['Halal', 'Shisha Lounge', 'Live Music'],
        images: ['https://images.unsplash.com/photo-1552566626-52f8b828add9'],
        thumbnail: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400',
        rating: 4.5,
        reviewCount: 654,
      },
    }),
  ]);

  console.log(`✅ Created ${restaurants.length} restaurants`);

  // ========================================
  // FINAL SUMMARY
  // ========================================
  console.log('\n🎉 ===== DATABASE SEEDING COMPLETED =====');
  console.log(`
    ✅ ${cities.length} Cities
    ✅ ${users.length} Users
    ✅ ${hotels.length} Hotels
    ✅ ${attractions.length} Attractions
    ✅ ${restaurants.length} Restaurants
    
    🔑 Test Accounts:
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Email: admin@vatravel.com
    Password: password123
    
    Email: user@vatravel.com
    Password: password123
    
    Email: demo@vatravel.com
    Password: password123
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
