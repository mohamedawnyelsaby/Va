import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
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
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
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
          if (!user.password) {
            if (credentials.password === user.id) {
              return { id: user.id, name: user.name, email: user.email };
            }
            return null;
          }
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;
          return { id: user.id, name: user.name, email: user.email };
        } catch (e) {
          return null;
        }
      },
    }),
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
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          const email = user.email!;
          const existingUser = await prisma.user.findUnique({
            where: { email },
          });
          if (!existingUser) {
            await prisma.user.create({
              data: {
                email,
                name: user.name || '',
                image: user.image || '',
                emailVerified: new Date(),
              },
            });
          }
          return true;
        } catch (e) {
          console.error('Google signIn error:', e);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.sub || token.id) as string;
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.sub = user.id;
        token.id = user.id;
      }
      if (account?.provider === 'google' && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
          });
          if (dbUser) {
            token.sub = dbUser.id;
            token.id = dbUser.id;
          }
        } catch (e) {}
      }
      return token;
    },
  },
};
