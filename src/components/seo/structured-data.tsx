'use client';

import { useEffect } from 'react';

interface HotelStructuredDataProps {
  hotel: {
    id: string;
    name: string;
    description: string;
    thumbnail: string;
    rating: number;
    reviewCount: number;
    pricePerNight: number;
    currency: string;
    address: string;
    city: {
      name: string;
      country: string;
    };
    amenities: string[];
    latitude?: number;
    longitude?: number;
  };
}

export function HotelStructuredData({ hotel }: HotelStructuredDataProps) {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Hotel',
      name: hotel.name,
      description: hotel.description,
      image: hotel.thumbnail,
      address: {
        '@type': 'PostalAddress',
        addressLocality: hotel.city.name,
        addressCountry: hotel.city.country,
        streetAddress: hotel.address,
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: hotel.rating,
        reviewCount: hotel.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
      priceRange: `${hotel.currency} ${hotel.pricePerNight}`,
      amenityFeature: hotel.amenities.map((amenity) => ({
        '@type': 'LocationFeatureSpecification',
        name: amenity,
      })),
      ...(hotel.latitude &&
        hotel.longitude && {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: hotel.latitude,
            longitude: hotel.longitude,
          },
        }),
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [hotel]);

  return null;
}

interface BreadcrumbStructuredDataProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function BreadcrumbStructuredData({
  items,
}: BreadcrumbStructuredDataProps) {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [items]);

  return null;
}

export function OrganizationStructuredData() {
  useEffect(() => {
    // Only facts we can stand behind. This used to publish a made-up phone number
    // (+1-555-0123, a fictional range), social accounts that are not ours
    // (facebook/twitter/instagram.com/vatravel) and a domain we do not own
    // (vatravel.com); search engines treat structured data as claims.
    // Add `sameAs` / `contactPoint` back here once real ones exist.
    const origin = window.location.origin;
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Va Travel',
      url: origin,
      description:
        'Your trusted travel partner for booking hotels, attractions, and restaurants worldwide.',
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
}
