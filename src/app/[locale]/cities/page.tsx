// src/app/[locale]/cities/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Cities | Va Travel',
  description: 'Discover amazing destinations around the world',
};

export default function CitiesPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold mb-8">All Cities</h1>
      <p className="text-gray-600 mb-8">
        Browse all available destinations
      </p>
      
      {/* TODO: Add city listing here */}
      <div className="text-center py-20">
        <p className="text-gray-500">City listing coming soon...</p>
      </div>
    </div>
  );
}
