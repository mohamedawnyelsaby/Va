// src/components/sections/popular-destinations.tsx

'use client';

import { motion } from 'framer-motion';
import { MapPin, Star, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

const destinations = [
  {
    id: 1,
    name: 'Paris, France',
    slug: 'paris',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    rating: 4.9,
    hotels: 1250,
    attractions: 450,
    description: 'The City of Light awaits with romantic streets and world-class cuisine',
  },
  {
    id: 2,
    name: 'Tokyo, Japan',
    slug: 'tokyo',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    rating: 4.8,
    hotels: 2100,
    attractions: 680,
    description: 'Experience the perfect blend of tradition and cutting-edge technology',
  },
  {
    id: 3,
    name: 'Dubai, UAE',
    slug: 'dubai',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
    rating: 4.7,
    hotels: 850,
    attractions: 320,
    description: 'Modern luxury meets Arabian hospitality in this desert oasis',
  },
  {
    id: 4,
    name: 'New York, USA',
    slug: 'new-york',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
    rating: 4.8,
    hotels: 1800,
    attractions: 520,
    description: 'The city that never sleeps offers endless entertainment and culture',
  },
  {
    id: 5,
    name: 'Rome, Italy',
    slug: 'rome',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
    rating: 4.9,
    hotels: 920,
    attractions: 410,
    description: 'Walk through history in the eternal city of ancient wonders',
  },
  {
    id: 6,
    name: 'Bali, Indonesia',
    slug: 'bali',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    rating: 4.7,
    hotels: 650,
    attractions: 280,
    description: 'Tropical paradise with pristine beaches and spiritual temples',
  },
];

export function PopularDestinations({ locale }: { locale: string }) {
  const { t } = useTranslation('home');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="py-20 bg-gradient-to-b from-[#0F1635] to-[#0A0E27]">
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-12"
        >
          <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            Popular Destinations
          </motion.h2>
          <motion.p variants={itemVariants} className="text-[#A0A7C7] max-w-2xl mx-auto">
            Explore the world's most amazing cities and create unforgettable memories
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {destinations.map((destination) => (
            <motion.div
              key={destination.id}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -10 }}
              className="group glass-effect rounded-2xl overflow-hidden border border-[#3B82F6]/20 hover:border-[#7C5CFC]/50 transition-all duration-300 cursor-pointer"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading={destination.id <= 3 ? 'eager' : 'lazy'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E27]/90 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-[#06B6D4]" />
                    <h3 className="text-xl font-bold">{destination.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                    <span className="font-medium">{destination.rating}</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-[#A0A7C7] mb-4 line-clamp-2">
                  {destination.description}
                </p>
                <div className="flex items-center justify-between text-sm text-[#707A95] mb-4">
                  <span>{destination.hotels} Hotels</span>
                  <span>{destination.attractions} Attractions</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full group bg-gradient-to-r from-[#3B82F6]/20 to-[#7C5CFC]/20 border border-[#3B82F6]/30 hover:border-[#3B82F6]/60 text-white px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  Explore
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-[#3B82F6] to-[#7C5CFC] hover:from-[#60A5FA] hover:to-[#A78BFA] text-white px-8 py-4 rounded-lg font-semibold inline-flex items-center gap-2 shadow-lg shadow-[#3B82F6]/30 transition-all"
          >
            View All Destinations
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
