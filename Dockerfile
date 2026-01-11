# ============================================
# VA TRAVEL - Production Dockerfile
# Multi-stage build for optimal image size
# ============================================

# ============================================
# STAGE 1: Dependencies Installation
# ============================================
FROM node:18-alpine AS deps

# Install system dependencies
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    python3 \
    make \
    g++

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --legacy-peer-deps

# ============================================
# STAGE 2: Build Application
# ============================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all application files
COPY . .

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=1

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js application
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# ============================================
# STAGE 3: Production Runtime
# ============================================
FROM node:18-alpine AS runner

WORKDIR /app

# Set runtime environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install runtime dependencies
RUN apk add --no-cache \
    openssl \
    ca-certificates

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma files for database access
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose application port
EXPOSE 3000

# Health check configuration
HEALTHCHECK --interval=30s \
            --timeout=10s \
            --start-period=40s \
            --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); })" || exit 1

# Start the application
CMD ["node", "server.js"]
```

---

## 📝 **الملف 2: `.dockerignore`**
**المسار:** `.dockerignore` (في الـ root)
```
# ============================================
# VA TRAVEL - Docker Ignore Configuration
# Files and directories to exclude from Docker build context
# ============================================

# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*
package-lock.json
yarn.lock
pnpm-lock.yaml

# Next.js build output
.next
out
.swc

# Production build
/build
dist

# Testing
coverage
.nyc_output
*.test.ts
*.test.tsx
*.spec.ts
*.spec.tsx
__tests__
__mocks__
jest.config.js
jest.setup.js

# Environment files (NEVER include in Docker image)
.env
.env.*
.env.local
.env.development
.env.test
.env.production.local
.env.development.local
.env.test.local

# Local development files
.DS_Store
*.pem
Thumbs.db
.cache

# IDE and editor files
.vscode
.idea
*.swp
*.swo
*~
.project
.classpath
.settings
.metadata

# Git files
.git
.gitignore
.gitattributes
.github

# Docker files
Dockerfile
Dockerfile.*
.dockerignore
docker-compose.yml
docker-compose.*.yml

# Documentation
README.md
README.*.md
CHANGELOG.md
CONTRIBUTING.md
LICENSE
*.md
docs/

# CI/CD
.gitlab-ci.yml
.travis.yml
azure-pipelines.yml
.circleci
.github

# Database files
*.db
*.sqlite
*.sqlite3

# Logs
logs
*.log

# Temporary files
tmp
temp
*.tmp
*.temp

# Prisma (migrations not needed in production)
prisma/migrations

# Storybook
storybook-static
.storybook

# Cypress
cypress/videos
cypress/screenshots
cypress.config.ts

# Vercel
.vercel

# Miscellaneous
.turbo
.eslintcache
tsconfig.tsbuildinfo
