import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { Adapter } from 'next-auth/adapters';
import { verifyPiUser } from '@/lib/pi-network/platform-api';

const handler = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: 'pi-network',
      name: 'Pi Network',
      credentials: {
        accessToken: { type: 'text' },
        uid: { type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.accessToken || !credentials?.uid) return null;
        try {
          const piUser = await verifyPiUser(credentials.accessToken);
          if (piUser.uid !== credentials.uid) return null;
          const user = await prisma.user.upsert({
            where: { piWalletId: piUser.uid },
            update: { piUsername: piUser.username, piAccessToken: credentials.accessToken },
            create: {
              email: piUser.uid + '@pi.network',
              piWalletId: piUser.uid,
              piUsername: piUser.username,
              piAccessToken: credentials.accessToken,
              name: piUser.username,
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
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
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
});

export { handler as GET, handler as POST };
