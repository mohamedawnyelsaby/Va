FROM node:18-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./

# السطر ده اتعدل عشان يثبت كل حاجة صح
RUN npm install

COPY . .

# توليد ملفات بريزما
RUN npx prisma generate || echo "no prisma"

# بناء المشروع
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
