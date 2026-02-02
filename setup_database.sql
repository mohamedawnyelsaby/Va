-- Create tables from Prisma schema

-- User table
CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    password TEXT,
    image TEXT,
    role TEXT DEFAULT 'user',
    tier TEXT DEFAULT 'free',
    phone TEXT,
    bio TEXT,
    "piWalletId" TEXT,
    "piUsername" TEXT,
    "piBalance" DOUBLE PRECISION DEFAULT 0,
    "piAccessToken" TEXT,
    "twoFactorEnabled" BOOLEAN DEFAULT false,
    "twoFactorSecret" TEXT,
    "backupCodes" TEXT,
    "emailVerified" TIMESTAMP,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- City table
CREATE TABLE IF NOT EXISTS "City" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    country TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    timezone TEXT NOT NULL,
    currency TEXT NOT NULL,
    language TEXT NOT NULL,
    "isPopular" BOOLEAN DEFAULT false,
    images TEXT[],
    thumbnail TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample cities
INSERT INTO "City" (id, name, slug, country, "countryCode", description, latitude, longitude, timezone, currency, language, "isPopular", images, thumbnail)
VALUES 
('city_paris', 'Paris', 'paris', 'France', 'FR', 'The City of Light', 48.8566, 2.3522, 'Europe/Paris', 'EUR', 'fr', true, 
 ARRAY['https://images.unsplash.com/photo-1502602898657-3e91760cbb34'], 
 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400'),
('city_dubai', 'Dubai', 'dubai', 'United Arab Emirates', 'AE', 'Luxury and innovation', 25.2048, 55.2708, 'Asia/Dubai', 'AED', 'ar', true,
 ARRAY['https://images.unsplash.com/photo-1512453979798-5ea266f8880c'],
 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400')
ON CONFLICT (slug) DO NOTHING;

