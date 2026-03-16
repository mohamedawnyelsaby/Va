// src/app/[locale]/hotels/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Search, MapPin, Star, Heart, SlidersHorizontal, Wifi } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default function HotelsPage() {
  const { locale } = useParams();
  const router = useRouter();

  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    starRating: '',
    sortBy: 'rating',
    order: 'desc',
  });

  const fetchHotels = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
      });
      const res = await fetch(`/api/hotels?${params}`);
      const data = await res.json();
      setHotels(data.hotels || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => { fetchHotels(); }, [fetchHotels]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHotels();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Find Your Perfect Hotel</h1>
          <p className="text-muted-foreground">Browse thousands of hotels worldwide</p>
        </div>

        {/* Search + Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search hotels..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit">Search</Button>
                <Button type="button" variant="outline" onClick={() => setShowFilters(!showFilters)}>
                  <SlidersHorizontal className="h-4 w-4 mr-2" />Filters
                </Button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Min Price</label>
                    <Input type="number" placeholder="0" value={filters.minPrice}
                      onChange={e => setFilters({ ...filters, minPrice: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Max Price</label>
                    <Input type="number" placeholder="999" value={filters.maxPrice}
                      onChange={e => setFilters({ ...filters, maxPrice: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Stars</label>
                    <select value={filters.starRating}
                      onChange={e => setFilters({ ...filters, starRating: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="">All</option>
                      {[5,4,3,2,1].map(s => <option key={s} value={s}>{s} Stars</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <select value={filters.sortBy}
                      onChange={e => setFilters({ ...filters, sortBy: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="rating">Rating</option>
                      <option value="pricePerNight">Price</option>
                      <option value="reviewCount">Reviews</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Order</label>
                    <select value={filters.order}
                      onChange={e => setFilters({ ...filters, order: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="desc">High → Low</option>
                      <option value="asc">Low → High</option>
                    </select>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
        ) : hotels.length === 0 ? (
          <Card><CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No hotels found. Try adjusting your filters.</p>
          </CardContent></Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map(hotel => (
                <Card key={hotel.id} className="group overflow-hidden hover:shadow-xl transition-all">
                  <Link href={`/${locale}/hotels/${hotel.id}`}>
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={hotel.thumbnail || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'}
                        alt={hotel.name} fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg"
                        onClick={e => e.preventDefault()}>
                        <Heart className="h-4 w-4" />
                      </button>
                      {hotel.isFeatured && (
                        <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Featured
                        </div>
                      )}
                      <div className="absolute bottom-4 left-4 flex gap-1">
                        {Array.from({ length: hotel.starRating || 0 }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-1">{hotel.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3" />
                        <span>{hotel.cityRelation?.name || hotel.city}, {hotel.cityRelation?.country || hotel.country}</span>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{hotel.rating?.toFixed(1) || '0.0'}</span>
                          <span className="text-sm text-muted-foreground">({hotel.reviewCount || 0})</span>
                        </div>
                        {hotel.amenities?.slice(0, 2).map((a: string) => (
                          <span key={a} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{a}</span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xl font-bold">{formatCurrency(hotel.pricePerNight, hotel.currency)}</p>
                          <p className="text-xs text-muted-foreground">per night</p>
                        </div>
                        <Button size="sm">Book Now</Button>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                  <Button key={i + 1} variant={currentPage === i + 1 ? 'default' : 'outline'} onClick={() => setCurrentPage(i + 1)}>{i + 1}</Button>
                ))}
                <Button variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
