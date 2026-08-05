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
  // `trustHost` is a next-auth v5/Auth.js option — this project is on
  // next-auth v4.24, which doesn't read this field at all (it's a silent
  // no-op here, and TypeScript correctly flags it as unknown). Trusting
  // the deployment host in v4 is controlled by NEXTAUTH_URL, so the field
  // is removed rather than kept as dead, misleading config.
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      // NextAuth's default naming applies the `__Secure-` prefix
      // automatically when the cookie is secure. Overriding the cookie
      // config here previously hardcoded the insecure name AND
      // `secure: false` unconditionally — meaning the session cookie
      // was never marked Secure even in production over HTTPS. Both are
      // now derived from NODE_ENV instead of being hardcoded off.
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
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
        if (!credentials?.email || !credentials?.password) {return null;}
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (!user) {return null;}
          if (!user.password) {
            // ✅ SECURITY FIX: this used to accept the user's own database
            // id as a valid "password" for accounts with no real password
            // set (Google/Pi Network users). A user's id is not a secret —
            // it appears in URLs and API responses throughout the app —
            // so this let anyone who saw a user's id sign in as them with
            // zero real credentials. OAuth-only accounts must sign in
            // through their real provider; credentials login just fails.
            return null;
          }
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {return null;}
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
        if (!credentials?.accessToken || !credentials?.uid) {return null;}
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
        } catch (e) {
          // Previously an empty catch block — a failed lookup here (DB
          // outage, network blip) vanished silently and the JWT callback
          // just continued without dbUser.id, with zero visibility into
          // why. Now at least logged so outages are diagnosable.
          console.error('[auth] Failed to resolve Google-linked user id:', e);
        }
      }
      return token;
    },
  },
};
