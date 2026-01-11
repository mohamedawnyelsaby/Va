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
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Va Travel',
      url: 'https://vatravel.com',
      logo: 'https://vatravel.com/logo.png',
      description:
        'Your trusted travel partner for booking hotels, attractions, and restaurants worldwide.',
      sameAs: [
        'https://facebook.com/vatravel',
        'https://twitter.com/vatravel',
        'https://instagram.com/vatravel',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-555-0123',
        contactType: 'customer service',
        availableLanguage: ['en', 'ar', 'fr', 'es'],
      },
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
