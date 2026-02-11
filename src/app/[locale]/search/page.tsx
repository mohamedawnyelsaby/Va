'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Link from 'next/link';

interface SearchResults {
  query: string;
  hotels: any[];
  cities: any[];
  attractions: any[];
  restaurants: any[];
  totalResults: number;
}

export default function SearchPage({
  params,
}: {
  params: { locale: string };
}) {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translations = {
    en: {
      search: 'Search',
      searching: 'Searching...',
      results: 'Search Results',
      noResults: 'No results found',
      hotels: 'Hotels',
      cities: 'Cities',
      attractions: 'Attractions',
      restaurants: 'Restaurants',
      totalResults: 'Total Results',
      perNight: 'per night',
      viewDetails: 'View Details',
      tryAgain: 'Please try searching for something else',
    },
    ar: {
      search: 'بحث',
      searching: 'جاري البحث...',
      results: 'نتائج البحث',
      noResults: 'لا توجد نتائج',
      hotels: 'الفنادق',
      cities: 'المدن',
      attractions: 'المعالم السياحية',
      restaurants: 'المطاعم',
      totalResults: 'إجمالي النتائج',
      perNight: 'لكل ليلة',
      viewDetails: 'عرض التفاصيل',
      tryAgain: 'يرجى البحث عن شيء آخر',
    },
  };

  const t = translations[params.locale as 'en' | 'ar'] || translations.en;

  useEffect(() => {
    if (query.length >= 2) {
      performSearch();
    }
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&type=all&limit=10`
      );
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
        <p className="ml-4 text-lg">{t.searching}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">
        {t.results}: "{query}"
      </h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      {results && results.totalResults === 0 && (
        <div className="rounded-lg bg-gray-100 p-8 text-center">
          <p className="text-xl font-semibold">{t.noResults}</p>
          <p className="mt-2 text-gray-600">{t.tryAgain}</p>
        </div>
      )}

      {results && results.totalResults > 0 && (
        <div className="space-y-8">
          <p className="text-lg text-gray-600">
            {t.totalResults}: {results.totalResults}
          </p>

          {/* Hotels */}
          {results.hotels.length > 0 && (
            <section>
              <h2 className="mb-4 text-2xl font-bold">{t.hotels}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.hotels.map((hotel: any) => (
                  <div
                    key={hotel.id}
                    className="overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md"
                  >
                    {hotel.thumbnail && (
                      <img
                        src={hotel.thumbnail}
                        alt={hotel.name}
                        className="h-48 w-full object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold">{hotel.name}</h3>
                      <p className="text-sm text-gray-600">
                        {hotel.city}, {hotel.country}
                      </p>
                      {hotel.pricePerNight && (
                        <p className="mt-2 font-bold text-blue-600">
                          {hotel.currency} {hotel.pricePerNight} {t.perNight}
                        </p>
                      )}
                      <Link
                        href={`/${params.locale}/hotels/${hotel.id}`}
                        className="mt-3 inline-block rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                      >
                        {t.viewDetails}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Cities */}
          {results.cities.length > 0 && (
            <section>
              <h2 className="mb-4 text-2xl font-bold">{t.cities}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.cities.map((city: any) => (
                  <div
                    key={city.id}
                    className="overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md"
                  >
                    {city.thumbnail && (
                      <img
                        src={city.thumbnail}
                        alt={city.name}
                        className="h-48 w-full object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold">{city.name}</h3>
                      <p className="text-sm text-gray-600">{city.country}</p>
                      <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                        {city.description}
                      </p>
                      <Link
                        href={`/${params.locale}/cities/${city.slug}`}
                        className="mt-3 inline-block rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                      >
                        {t.viewDetails}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Attractions */}
          {results.attractions.length > 0 && (
            <section>
              <h2 className="mb-4 text-2xl font-bold">{t.attractions}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.attractions.map((attraction: any) => (
                  <div
                    key={attraction.id}
                    className="overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md"
                  >
                    {attraction.thumbnail && (
                      <img
                        src={attraction.thumbnail}
                        alt={attraction.name}
                        className="h-48 w-full object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold">{attraction.name}</h3>
                      <p className="text-sm text-gray-600">
                        {attraction.city}, {attraction.country}
                      </p>
                      <p className="mt-1 text-sm text-blue-600">
                        {attraction.category}
                      </p>
                      <Link
                        href={`/${params.locale}/attractions/${attraction.id}`}
                        className="mt-3 inline-block rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                      >
                        {t.viewDetails}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Restaurants */}
          {results.restaurants.length > 0 && (
            <section>
              <h2 className="mb-4 text-2xl font-bold">{t.restaurants}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.restaurants.map((restaurant: any) => (
                  <div
                    key={restaurant.id}
                    className="overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md"
                  >
                    {restaurant.thumbnail && (
                      <img
                        src={restaurant.thumbnail}
                        alt={restaurant.name}
                        className="h-48 w-full object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold">{restaurant.name}</h3>
                      <p className="text-sm text-gray-600">
                        {restaurant.city}, {restaurant.country}
                      </p>
                      <p className="mt-1 text-sm text-blue-600">
                        {restaurant.cuisine}
                      </p>
                      <Link
                        href={`/${params.locale}/restaurants/${restaurant.id}`}
                        className="mt-3 inline-block rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                      >
                        {t.viewDetails}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
