// src/types/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    // Application
    NEXT_PUBLIC_APP_URL: string;
    NEXT_PUBLIC_APP_NAME: string;
    NEXT_PUBLIC_APP_DESCRIPTION: string;
    NEXT_PUBLIC_SUPPORT_EMAIL: string;
    
    // Database
    DATABASE_URL: string;
    DIRECT_URL?: string;
    
    // Authentication
    NEXTAUTH_SECRET: string;
    NEXTAUTH_URL: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    
    // Google APIs
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: string;
    GOOGLE_PLACES_API_KEY: string;
    
    // OpenAI
    OPENAI_API_KEY: string;
    
    // Stripe
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    
    // Pi Network
    NEXT_PUBLIC_PI_APP_ID: string;
    PI_API_KEY: string;
    PI_SECRET_KEY: string;
    NEXT_PUBLIC_PI_NETWORK_API_URL: string;
    
    // Redis
    REDIS_URL?: string;
    UPSTASH_REDIS_REST_URL?: string;
    UPSTASH_REDIS_REST_TOKEN?: string;
    
    // Email
    RESEND_API_KEY: string;
    EMAIL_FROM: string;
    
    // Cloudinary
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
    
    // Analytics
    NEXT_PUBLIC_GA_TRACKING_ID?: string;
    NEXT_PUBLIC_HOTJAR_ID?: string;
    NEXT_PUBLIC_CRISP_WEBSITE_ID?: string;
    
    // Feature Flags
    NEXT_PUBLIC_ENABLE_AI_RECOMMENDATIONS: string;
    NEXT_PUBLIC_ENABLE_PI_PAYMENTS: string;
    NEXT_PUBLIC_ENABLE_DARK_MODE: string;
    
    // Development
    NODE_ENV: 'development' | 'production' | 'test';
    DEBUG?: string;
  }
}
