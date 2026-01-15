// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type'); // 'hotels', 'cities', 'attractions', 'restaurants', 'all'
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const searchQuery = {
      contains: query,
      mode: 'insensitive' as const,
    };

    const results: any = {
      query,
      hotels: [],
      cities: [],
      attractions: [],
      restaurants: [],
    };

    // Search Hotels
    if (!type || type === 'hotels' || type === 'all') {
      results.hotels = await prisma.hotel.findMany({
        where: {
          OR: [
            { name: searchQuery },
            { description: searchQuery },
            { city: searchQuery },
          ],
        },
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          shortDescription: true,
          city: true,
          country: true,
          pricePerNight: true,
          currency: true,
          starRating: true,
          rating: true,
          thumbnail: true,
          isFeatured: true,
        },
      });
    }

    // Search Cities
    if (!type || type === 'cities' || type === 'all') {
      results.cities = await prisma.city.findMany({
        where: {
          OR: [
            { name: searchQuery },
            { country: searchQuery },
            { description: searchQuery },
          ],
        },
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          country: true,
          countryCode: true,
          description: true,
          thumbnail: true,
          isPopular: true,
        },
      });
    }

    // Search Attractions
    if (!type || type === 'attractions' || type === 'all') {
      results.attractions = await prisma.attraction.findMany({
        where: {
          OR: [
            { name: searchQuery },
            { description: searchQuery },
            { city: searchQuery },
            { category: searchQuery },
          ],
        },
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          shortDescription: true,
          category: true,
          city: true,
          country: true,
          ticketPrice: true,
          currency: true,
          rating: true,
          thumbnail: true,
          isPopular: true,
        },
      });
    }

    // Search Restaurants
    if (!type || type === 'restaurants' || type === 'all') {
      results.restaurants = await prisma.restaurant.findMany({
        where: {
          OR: [
            { name: searchQuery },
            { description: searchQuery },
            { city: searchQuery },
          ],
        },
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          cuisine: true,
          priceRange: true,
          city: true,
          country: true,
          rating: true,
          thumbnail: true,
          isFeatured: true,
        },
      });
    }

    // Calculate total results
    const totalResults = 
      results.hotels.length + 
      results.cities.length + 
      results.attractions.length + 
      results.restaurants.length;

    return NextResponse.json({
      ...results,
      totalResults,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
