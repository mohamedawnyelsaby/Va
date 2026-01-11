import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import type { Adapter } from 'next-auth/adapters';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/db';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
    newUser: '/onboarding',
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            accounts: true,
          },
        });

        if (!user || !user.password) {
          throw new Error('User not found');
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        if (!user.emailVerified) {
          throw new Error('Please verify your email first');
        }

        if (user.status === 'suspended') {
          throw new Error('Your account has been suspended');
        }

        if (user.status === 'banned') {
          throw new Error('Your account has been banned');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tier = user.tier;
      }

      if (account?.provider === 'pi-network') {
        token.piAccessToken = account.access_token;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.tier = token.tier as string;
        session.user.piAccessToken = token.piAccessToken as string;
      }

      return session;
    },

    async signIn({ user, account, profile }) {
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
      });

      if (dbUser && (dbUser.status === 'suspended' || dbUser.status === 'banned')) {
        return false;
      }

      if (dbUser) {
        await prisma.securityLog.create({
          data: {
            userId: dbUser.id,
            action: 'LOGIN',
            ipAddress: '',
            userAgent: '',
            metadata: {
              provider: account?.provider,
            },
          },
        });
      }

      return true;
    },
  },

  events: {
    async signOut({ token }) {
      if (token?.id) {
        await prisma.securityLog.create({
          data: {
            userId: token.id as string,
            action: 'LOGOUT',
            ipAddress: '',
            userAgent: '',
          },
        });
      }
    },
  },

  debug: process.env.NODE_ENV === 'development',
};
