// src/app/api/search/route.ts - AI-Powered Universal Search
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type'); // hotel, attraction, restaurant, city
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query too short' }, { status: 400 });
    }
    
    const searchQuery = {
      contains: query,
      mode: 'insensitive' as const,
    };
    
    const results: any = {
      hotels: [],
      attractions: [],
      restaurants: [],
      cities: [],
      total: 0,
    };
    
    // Search Hotels
    if (!type || type === 'hotel') {
      results.hotels = await prisma.hotel.findMany({
        where: {
          isActive: true,
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
          thumbnail: true,
          pricePerNight: true,
          currency: true,
          rating: true,
          reviewCount: true,
          city: true,
          starRating: true,
        },
      });
    }
    
    // Search Attractions
    if (!type || type === 'attraction') {
      results.attractions = await prisma.attraction.findMany({
        where: {
          isActive: true,
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
          thumbnail: true,
          ticketPrice: true,
          currency: true,
          rating: true,
          reviewCount: true,
          city: true,
          category: true,
        },
      });
    }
    
    // Search Restaurants
    if (!type || type === 'restaurant') {
      results.restaurants = await prisma.restaurant.findMany({
        where: {
          isActive: true,
          OR: [
            { name: searchQuery },
            { description: searchQuery },
            { city: searchQuery },
            { cuisine: { has: query } },
          ],
        },
        take: limit,
        select: {
          id: true,
          name: true,
          thumbnail: true,
          priceRange: true,
          rating: true,
          reviewCount: true,
          city: true,
          cuisine: true,
        },
      });
    }
    
    // Search Cities
    if (!type || type === 'city') {
      results.cities = await prisma.city.findMany({
        where: {
          isActive: true,
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
          country: true,
          thumbnail: true,
          description: true,
          _count: {
            select: {
              hotels: true,
              attractions: true,
              restaurants: true,
            },
          },
        },
      });
    }
    
    results.total = 
      results.hotels.length +
      results.attractions.length +
      results.restaurants.length +
      results.cities.length;
    
    // AI-Powered Ranking (Simple implementation)
    // In production, use OpenAI embeddings for semantic search
    const allResults = [
      ...results.hotels.map(h => ({ ...h, type: 'hotel', score: calculateScore(h, query) })),
      ...results.attractions.map(a => ({ ...a, type: 'attraction', score: calculateScore(a, query) })),
      ...results.restaurants.map(r => ({ ...r, type: 'restaurant', score: calculateScore(r, query) })),
      ...results.cities.map(c => ({ ...c, type: 'city', score: calculateScore(c, query) })),
    ].sort((a, b) => b.score - a.score);
    
    return NextResponse.json({
      query,
      results: type ? results[`${type}s`] : allResults.slice(0, limit),
      categorized: results,
      total: results.total,
      suggestions: await generateSuggestions(query),
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

// Simple scoring algorithm (can be enhanced with ML)
function calculateScore(item: any, query: string): number {
  let score = 0;
  const queryLower = query.toLowerCase();
  const nameLower = item.name?.toLowerCase() || '';
  
  // Exact match
  if (nameLower === queryLower) score += 100;
  
  // Starts with query
  if (nameLower.startsWith(queryLower)) score += 50;
  
  // Contains query
  if (nameLower.includes(queryLower)) score += 25;
  
  // Rating boost
  if (item.rating) score += item.rating * 5;
  
  // Review count boost (popularity)
  if (item.reviewCount) score += Math.log(item.reviewCount + 1) * 2;
  
  // Featured boost
  if (item.isFeatured) score += 20;
  
  return score;
}

// Generate search suggestions (can be enhanced with AI)
async function generateSuggestions(query: string): Promise<string[]> {
  const suggestions: string[] = [];
  
  // Get popular cities
  const cities = await prisma.city.findMany({
    where: {
      isPopular: true,
      name: { contains: query, mode: 'insensitive' },
    },
    take: 3,
    select: { name: true },
  });
  
  suggestions.push(...cities.map(c => c.name));
  
  // Get popular searches (can be stored in Redis)
  const commonSearches = [
    'luxury hotels',
    'budget hotels',
    'family restaurants',
    'romantic restaurants',
    'historical attractions',
    'beach attractions',
  ];
  
  const matchingSearches = commonSearches.filter(s =>
    s.toLowerCase().includes(query.toLowerCase())
  );
  
  suggestions.push(...matchingSearches);
  
  return Array.from(new Set(suggestions)).slice(0, 5);

}
