// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Cities
  const cities = await Promise.all([
    prisma.city.create({
      data: {
        name: 'Paris',
        country: 'France',
        countryCode: 'FR',
        description: 'The City of Light, known for its art, fashion, and culture.',
        latitude: 48.8566,
        longitude: 2.3522,
        timezone: 'Europe/Paris',
        currency: 'EUR',
        language: 'fr',
        isPopular: true,
        images: ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800'],
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
        images: ['https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800'],
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
        images: ['https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800'],
        thumbnail: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
      },
    }),
  ]);

  console.log(`✅ Created ${cities.length} cities`);

  // Create Test User
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const user = await prisma.user.create({
    data: {
      email: 'test@vatravel.com',
      password: hashedPassword,
      name: 'Test User',
      isVerified: true,
      piBalance: 100,
    },
  });

  await prisma.preference.create({
    data: {
      userId: user.id,
      currency: 'USD',
      language: 'en',
    },
  });

  console.log('✅ Created test user: test@vatravel.com / password123');

  // Create Hotels
  const hotels = await Promise.all(
    cities.flatMap((city, cityIndex) => [
      prisma.hotel.create({
        data: {
          name: `Luxury Hotel ${cityIndex + 1}`,
          description: 'Experience world-class luxury and comfort in the heart of the city.',
          shortDescription: 'World-class luxury hotel',
          address: `${cityIndex + 1} Main Street`,
          city: city.name,
          country: city.country,
          latitude: city.latitude + 0.01,
          longitude: city.longitude + 0.01,
          starRating: 5,
          pricePerNight: 200 + cityIndex * 50,
          currency: city.currency,
          amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Spa'],
          roomTypes: [
            { type: 'Standard', price: 200, description: 'Comfortable standard room' },
            { type: 'Deluxe', price: 300, description: 'Spacious deluxe room' },
            { type: 'Suite', price: 500, description: 'Luxury suite' },
          ],
          images: [`https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800`],
          thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
          cityId: city.id,
          isFeatured: cityIndex === 0,
          rating: 4.5 + Math.random() * 0.5,
          reviewCount: Math.floor(Math.random() * 500) + 100,
        },
      }),
      prisma.hotel.create({
        data: {
          name: `Budget Hotel ${cityIndex + 1}`,
          description: 'Affordable comfort in a convenient location.',
          shortDescription: 'Affordable and comfortable',
          address: `${cityIndex + 10} Side Street`,
          city: city.name,
          country: city.country,
          latitude: city.latitude - 0.01,
          longitude: city.longitude - 0.01,
          starRating: 3,
          pricePerNight: 80 + cityIndex * 20,
          currency: city.currency,
          amenities: ['WiFi', 'Breakfast'],
          roomTypes: [
            { type: 'Standard', price: 80, description: 'Basic comfortable room' },
          ],
          images: [`https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800`],
          thumbnail: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
          cityId: city.id,
          rating: 4.0 + Math.random() * 0.5,
          reviewCount: Math.floor(Math.random() * 300) + 50,
        },
      }),
    ])
  );

  console.log(`✅ Created ${hotels.length} hotels`);

  // Create Attractions
  const attractions = await Promise.all(
    cities.map((city, index) =>
      prisma.attraction.create({
        data: {
          name: `Famous Landmark ${index + 1}`,
          description: 'A must-visit attraction showcasing the city\'s heritage.',
          shortDescription: 'Historic landmark',
          category: 'Monument',
          address: `Landmark Square ${index + 1}`,
          city: city.name,
          country: city.country,
          latitude: city.latitude + 0.02,
          longitude: city.longitude + 0.02,
          ticketPrice: 20 + index * 5,
          currency: city.currency,
          duration: '2-3 hours',
          images: [`https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800`],
          thumbnail: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400',
          cityId: city.id,
          isPopular: index === 0,
          rating: 4.6 + Math.random() * 0.4,
          reviewCount: Math.floor(Math.random() * 1000) + 200,
        },
      })
    )
  );

  console.log(`✅ Created ${attractions.length} attractions`);

  // Create Restaurants
  const restaurants = await Promise.all(
    cities.map((city, index) =>
      prisma.restaurant.create({
        data: {
          name: `Gourmet Restaurant ${index + 1}`,
          description: 'Fine dining experience with local and international cuisine.',
          cuisine: ['French', 'International'],
          priceRange: '$$$',
          address: `Food Street ${index + 1}`,
          city: city.name,
          country: city.country,
          latitude: city.latitude - 0.02,
          longitude: city.longitude + 0.02,
          images: [`https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800`],
          thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
          cityId: city.id,
          isFeatured: index === 1,
          rating: 4.4 + Math.random() * 0.6,
          reviewCount: Math.floor(Math.random() * 400) + 100,
        },
      })
    )
  );

  console.log(`✅ Created ${restaurants.length} restaurants`);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
