FROM node:18-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --ignore-scripts
COPY . .
RUN npx prisma generate || echo "prisma skip"
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
