FROM node:18-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# نسخ ملفات التعريف
COPY package.json package-lock.json* ./

# التعديل الجوهري: شيلنا --ignore-scripts عشان يثبت next صح
RUN npm install

# نسخ باقي الملفات
COPY . .

# توليد Prisma
RUN npx prisma generate || echo "no prisma"

# بناء المشروع (هينجح المرة دي)
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
