// src/lib/auth/options.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { Adapter } from 'next-auth/adapters';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  // ✅ الإصلاح الرئيسي: secure: false عشان Pi Browser بيشتغل على HTTP
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false, // كان true وده سبب المشكلة
      },
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // المستخدمين العاديين + Pi users عن طريق email/id
    CredentialsProvider({
      id: 'credentials',
      name: 'Email',
      credentials: {
        email: { type: 'text' },
        password: { type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (!user) return null;

          // Pi users: password = user.id
          if (!user.password) {
            if (credentials.password === user.id) {
              return { id: user.id, name: user.name, email: user.email };
            }
            return null;
          }

          // مستخدم عادي: bcrypt
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;

          return { id: user.id, name: user.name, email: user.email };
        } catch (e) {
          return null;
        }
      },
    }),

    // Pi Network provider المباشر
    CredentialsProvider({
      id: 'pi-network',
      name: 'Pi Network',
      credentials: {
        accessToken: { type: 'text' },
        uid: { type: 'text' },
        username: { type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.accessToken || !credentials?.uid) return null;
        try {
          const piUid = credentials.uid;
          const piUsername = credentials.username || piUid;
          const user = await prisma.user.upsert({
            where: { piWalletId: piUid },
            update: {
              piUsername: piUsername,
              piAccessToken: credentials.accessToken,
            },
            create: {
              email: piUid + '@pi.network',
              piWalletId: piUid,
              piUsername: piUsername,
              piAccessToken: credentials.accessToken,
              name: piUsername,
              emailVerified: new Date(),
            },
          });
          return { id: user.id, name: user.name, email: user.email };
        } catch (e) {
          console.error('Pi auth error:', e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.sub || token.id) as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.id = user.id;
      }
      return token;
    },
  },
};
