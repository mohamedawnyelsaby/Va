// prisma/seed.ts
// ✅ COMPLETE SEED FILE WITH ALL DATA

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
        isVerified: true,
        piBalance: 1000,
        loyaltyPoints: 5000,
        loyaltyTier: 'platinum',
      },
    }),
    prisma.user.create({
      data: {
        email: 'user@vatravel.com',
        password: hashedPassword,
        name: 'Test User',
        isVerified: true,
        piBalance: 100,
        loyaltyPoints: 500,
        loyaltyTier: 'silver',
      },
    }),
    prisma.user.create({
      data: {
        email: 'demo@vatravel.com',
        password: hashedPassword,
        name: 'Demo User',
        isVerified: true,
        piBalance: 50,
        loyaltyPoints: 100,
        loyaltyTier: 'bronze',
      },
    }),
  ]);

  // Create preferences for users
  for (const user of users) {
    await prisma.preference.create({
      data: {
        userId: user.id,
        currency: 'USD',
        language: 'en',
        notificationsEnabled: true,
        emailNotifications: true,
      },
    });
  }

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
  // 6. CREATE SERVICES
  // ========================================
  console.log('🚕 Creating services...');

  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Airport Transfer - Luxury',
        description: 'Premium airport transfer service with professional drivers.',
        category: 'Transport',
        price: 50,
        currency: 'USD',
        duration: '1 hour',
        city: cities[0].name,
        cityId: cities[0].id,
        images: ['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d'],
        thumbnail: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400',
        rating: 4.7,
        reviewCount: 234,
      },
    }),
    prisma.service.create({
      data: {
        name: 'City Tour - Full Day',
        description: 'Comprehensive city tour covering all major attractions.',
        category: 'Tour',
        price: 80,
        currency: 'USD',
        duration: '8 hours',
        city: cities[1].name,
        cityId: cities[1].id,
        images: ['https://images.unsplash.com/photo-1464037866556-6812c9d1c72e'],
        thumbnail: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=400',
        rating: 4.9,
        reviewCount: 567,
      },
    }),
  ]);

  console.log(`✅ Created ${services.length} services`);

  // ========================================
  // 7. CREATE SAMPLE BOOKINGS
  // ========================================
  console.log('📅 Creating bookings...');

  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        userId: users[1].id,
        itemType: 'hotel',
        hotelId: hotels[0].id,
        itemName: hotels[0].name,
        startDate: new Date('2024-12-25'),
        endDate: new Date('2024-12-30'),
        checkInDate: new Date('2024-12-25T14:00:00'),
        checkOutDate: new Date('2024-12-30T12:00:00'),
        guests: 2,
        rooms: 1,
        totalPrice: 1100,
        currency: 'EUR',
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'credit_card',
      },
    }),
  ]);

  console.log(`✅ Created ${bookings.length} bookings`);

  // ========================================
  // 8. CREATE REVIEWS
  // ========================================
  console.log('⭐ Creating reviews...');

  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        userId: users[1].id,
        itemType: 'hotel',
        hotelId: hotels[0].id,
        rating: 5,
        title: 'Absolutely Amazing Stay!',
        comment: 'Best hotel experience ever. Staff was incredibly helpful, room was spotless, and the view was breathtaking.',
        images: [],
        isVerified: true,
      },
    }),
    prisma.review.create({
      data: {
        userId: users[2].id,
        itemType: 'attraction',
        attractionId: attractions[0].id,
        rating: 5,
        title: 'Must Visit!',
        comment: 'Iconic landmark that exceeded expectations. Go at sunset for the best experience.',
        images: [],
        isVerified: true,
      },
    }),
  ]);

  console.log(`✅ Created ${reviews.length} reviews`);

  // ========================================
  // 9. CREATE NOTIFICATIONS
  // ========================================
  console.log('🔔 Creating notifications...');

  await Promise.all(
    users.map((user) =>
      prisma.notification.create({
        data: {
          userId: user.id,
          type: 'system',
          title: '🎉 Welcome to Va Travel!',
          message: 'Thank you for joining us. Start exploring amazing destinations worldwide!',
          data: { piBonus: 100 },
        },
      })
    )
  );

  console.log('✅ Created notifications');

  // ========================================
  // 10. FINAL SUMMARY
  // ========================================
  console.log('\n🎉 ===== DATABASE SEEDING COMPLETED =====');
  console.log(`
    ✅ ${cities.length} Cities
    ✅ ${users.length} Users
    ✅ ${hotels.length} Hotels
    ✅ ${attractions.length} Attractions
    ✅ ${restaurants.length} Restaurants
    ✅ ${services.length} Services
    ✅ ${bookings.length} Bookings
    ✅ ${reviews.length} Reviews
    
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
