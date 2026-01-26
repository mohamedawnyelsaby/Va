#!/bin/bash

# ============================================
# DATABASE SETUP SCRIPT
# ============================================

echo "🚀 Starting database setup..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo -e "${YELLOW}📝 Creating .env from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env created. Please update it with your credentials.${NC}"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL not set in .env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables loaded${NC}"

# Generate Prisma Client
echo -e "${YELLOW}📦 Generating Prisma Client...${NC}"
npx prisma generate

# Run migrations
echo -e "${YELLOW}🔄 Running database migrations...${NC}"
npx prisma migrate deploy

# Seed database
echo -e "${YELLOW}🌱 Seeding database...${NC}"
npx tsx prisma/seed.ts

echo -e "${GREEN}✅ Database setup complete!${NC}"
echo -e "${GREEN}🎉 You can now run: npm run dev${NC}"
