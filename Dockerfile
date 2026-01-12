FROM node:18-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. Copy package files
COPY package.json package-lock.json* ./

# 2. Install dependencies (ignoring postinstall for now)
RUN npm install --ignore-scripts

# 3. Copy the rest of your code
COPY . .

# 4. NOW generate prisma (after files are copied)
RUN npx prisma generate || echo "no prisma"

# 5. Build the project
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
