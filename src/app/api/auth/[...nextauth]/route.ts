import NextAuth from 'next-auth';
import { prisma } from '@/lib/db';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
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
        username: { type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.accessToken || !credentials?.uid) return null;
        try {
          console.log('🔑 authorize called:', { uid: credentials.uid, username: credentials.username });
          const piUid = credentials.uid;
          const piUsername = credentials.username || piUid;
          console.log('📝 upserting user:', { piUid, piUsername });
          const user = await prisma.user.upsert({
            where: { piWalletId: piUid },
            update: { piUsername: piUsername, piAccessToken: credentials.accessToken },
            create: {
              email: piUid + '@pi.network',
              piWalletId: piUid,
              piUsername: piUsername,
              piAccessToken: credentials.accessToken,
              name: piUsername,
              emailVerified: new Date(),
            },
          });
          console.log('✅ user upserted:', user.id);
          return { id: user.id, name: user.name, email: user.email };
        } catch (e) {
          console.error('❌ Pi auth error:', e);
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
