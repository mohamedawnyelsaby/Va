'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Search, 
  MapPin, 
  Star,
  Heart,
  SlidersHorizontal,
  Utensils,
  DollarSign
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function RestaurantsPage() {
  const params = useParams();
  const locale = params.locale as string || 'en';
  
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    cityId: '',
    cuisine: '',
    priceRange: '',
    sortBy: 'rating',
    order: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const cuisineTypes = [
    'Italian',
    'Chinese',
    'Japanese',
    'Mexican',
    'French',
    'Indian',
    'Thai',
    'Mediterranean',
    'American',
    'Arabic',
    'Korean',
    'Vietnamese',
    'Greek',
    'Spanish'
  ];

  const priceRanges = [
    { value: '$', label: '$ - Budget' },
    { value: '$$', label: '$$ - Moderate' },
    { value: '$$$', label: '$$$ - Upscale' },
    { value: '$$$$', label: '$$$$ - Fine Dining' }
  ];

  useEffect(() => {
    fetchRestaurants();
  }, [currentPage, filters]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...filters,
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/restaurants?${params}`);
      const data = await response.json();

      setRestaurants(data.restaurants || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchRestaurants();
  };

  const getPriceRangeDisplay = (range: string) => {
    return range || '$$';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Discover Great Restaurants</h1>
          <p className="text-muted-foreground">
            Find the perfect dining experience around the world
          </p>
        </div>

        {/* Search & Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search restaurants, cuisines, or locations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button type="submit">Search</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cuisine</label>
                    <select
                      value={filters.cuisine}
                      onChange={(e) => setFilters({ ...filters, cuisine: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">All Cuisines</option>
                      {cuisineTypes.map(cuisine => (
                        <option key={cuisine} value={cuisine}>{cuisine}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Price Range</label>
                    <select
                      value={filters.priceRange}
                      onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Any Price</option>
                      {priceRanges.map(range => (
                        <option key={range.value} value={range.value}>{range.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="rating">Rating</option>
                      <option value="reviewCount">Reviews</option>
                      <option value="name">Name</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Order</label>
                    <select
                      value={filters.order}
                      onChange={(e) => setFilters({ ...filters, order: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="desc">High to Low</option>
                      <option value="asc">Low to High</option>
                    </select>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : restaurants.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No restaurants found. Try adjusting your filters.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <Card key={restaurant.id} className="group overflow-hidden hover:shadow-xl transition-all">
                  <Link href={`/${locale}/restaurants/${restaurant.id}`}>
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={restaurant.thumbnail || '/placeholder-restaurant.jpg'}
                        alt={restaurant.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <button
                        className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                        onClick={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <Heart className="h-4 w-4" />
                      </button>
                      {restaurant.isFeatured && (
                        <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Featured
                        </div>
                      )}
                      <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <Utensils className="h-3 w-3" />
                        {Array.isArray(restaurant.cuisine) ? restaurant.cuisine[0] : restaurant.cuisine}
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                        {restaurant.name}
                      </h3>

                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {restaurant.cityRelation?.name || restaurant.city}, {restaurant.cityRelation?.country || restaurant.country}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{restaurant.rating?.toFixed(1) || '0.0'}</span>
                          <span className="text-sm text-muted-foreground">
                            ({restaurant.reviewCount || 0})
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-600">
                            {getPriceRangeDisplay(restaurant.priceRange)}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {restaurant.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(restaurant.cuisine) 
                            ? restaurant.cuisine.slice(0, 2).map((c: string, i: number) => (
                                <span key={i} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                  {c}
                                </span>
                              ))
                            : <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {restaurant.cuisine}
                              </span>
                          }
                        </div>
                        <Button size="sm">View Details</Button>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                    <Button
                      key={i + 1}
                      variant={currentPage === i + 1 ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
