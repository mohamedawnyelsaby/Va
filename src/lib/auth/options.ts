// src/lib/auth/options.ts
//
// SECURITY FIXES IN THIS VERSION
// 1) [CRITICAL] The 'pi-network' provider used to trust the client-supplied
//    `uid` / `accessToken` without verifying them with Pi Network. Anyone
//    could POST any uid to /api/auth/callback/pi-network and be signed in as
//    that user. It now verifies the token against Pi's /v2/me and requires
//    the returned uid to match.
// 2) Pi access tokens are no longer persisted in the database.
// 3) Credentials login: email is normalised (signup lowercases it, login did
//    not), a bcrypt comparison always runs (no user-enumeration timing
//    signal), deactivated accounts are rejected.
// 4) Google login: requires a verified Google email, and neutralises
//    "pre-hijacked" accounts (someone signing up with a victim's email and a
//    password before the victim ever logs in with Google).
// 5) Google provider is only registered when its env vars exist.
// 6) If the Google -> DB user lookup fails, sign-in now fails closed instead
//    of continuing with Google's own id as the user id.
// 7) role / tier are exposed on the session for UI use. Authorization
//    decisions on the server must still re-read the role from the DB.

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { captureException } from '@/lib/monitoring/sentry';
import { verifyPiUser } from '@/lib/pi-network/platform-api';
import { logger } from '@/lib/logger';

// Precomputed bcrypt hash (cost 12) of a random string. Compared against when
// the email does not exist so that "unknown email" and "wrong password" take
// the same time.
const DUMMY_HASH = '$2a$12$xFq20GX2ju58DPV4mzX5YOod2PBiRaHBcsilfcEwDB08z7NXP1GP6';
const MAX_PASSWORD_LENGTH = 128;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const googleEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
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
    ...(googleEnabled
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
          }),
        ]
      : []),

    CredentialsProvider({
      id: 'credentials',
      name: 'Email',
      credentials: {
        email: { type: 'text' },
        password: { type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {return null;}
        if (credentials.password.length > MAX_PASSWORD_LENGTH) {return null;}

        try {
          const email = normalizeEmail(credentials.email);
          const user = await prisma.user.findUnique({ where: { email } });

          // Always run exactly one bcrypt comparison (see DUMMY_HASH above).
          const isValid = await bcrypt.compare(
            credentials.password,
            user?.password ?? DUMMY_HASH
          );

          // OAuth-only / Pi-only accounts (no password) can never log in here.
          if (!user || !user.password || !isValid) {return null;}
          if (!user.isActive) {return null;}

          return { id: user.id, name: user.name, email: user.email };
        } catch (e) {
          logger.error('[auth] credentials authorize error:', e);
          captureException(e instanceof Error ? e : new Error(String(e)), {
            context: 'credentials authorize',
          });
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
          // ✅ The ONLY source of truth for who this is: Pi Network itself.
          // The client-supplied uid/username are never trusted on their own.
          const piUser = await verifyPiUser(credentials.accessToken);

          if (!piUser?.uid || piUser.uid !== credentials.uid) {
            logger.warn('[auth] Pi sign-in rejected: uid mismatch');
            return null;
          }

          const piUsername = String(piUser.username || piUser.uid).slice(0, 100);

          const user = await prisma.user.upsert({
            where: { piWalletId: piUser.uid },
            update: { piUsername },
            create: {
              email: `${piUser.uid}@pi.network`,
              piWalletId: piUser.uid,
              piUsername,
              name: piUsername,
              emailVerified: new Date(),
            },
          });

          if (!user.isActive) {return null;}

          return { id: user.id, name: user.name, email: user.email };
        } catch (e) {
          // Includes Pi API failures/timeouts: fail closed, never fall back
          // to trusting the client.
          logger.error('[auth] Pi authorize error:', e instanceof Error ? e.message : e);
          captureException(e instanceof Error ? e : new Error(String(e)), {
            context: 'pi-network credentials authorize',
          });
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          const googleProfile = profile as { email_verified?: boolean } | undefined;
          if (!googleProfile?.email_verified || !user.email) {
            logger.warn('[auth] Google sign-in rejected: unverified email');
            return false;
          }

          const email = normalizeEmail(user.email);
          const existingUser = await prisma.user.findUnique({ where: { email } });

          if (!existingUser) {
            await prisma.user.create({
              data: {
                email,
                name: user.name || '',
                image: user.image || '',
                emailVerified: new Date(),
              },
            });
            return true;
          }

          if (!existingUser.isActive) {return false;}

          // Pre-hijack protection: an account with this email that was created
          // via password signup but never verified may belong to an attacker.
          // Google has just proven the real owner controls this email, so we
          // mark it verified and drop the (untrusted) password.
          if (!existingUser.emailVerified) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                emailVerified: new Date(),
                ...(existingUser.password ? { password: null } : {}),
              },
            });
          }
          return true;
        } catch (e) {
          logger.error('[auth] Google signIn error:', e);
          captureException(e instanceof Error ? e : new Error(String(e)), {
            context: 'google signIn callback',
          });
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
        token.id = user.id;
      }

      // Sign-in time only (`user` is undefined on later token refreshes).
      if (user) {
        try {
          if (account?.provider === 'google' && token.email) {
            const dbUser = await prisma.user.findUnique({
              where: { email: normalizeEmail(token.email) },
            });
            if (!dbUser) {
              throw new Error('Google-linked user not found');
            }
            token.sub = dbUser.id;
            token.id = dbUser.id;
          }

          const roleRow = await prisma.user.findUnique({
            where: { id: token.id },
            select: { role: true, tier: true },
          });
          token.role = roleRow?.role ?? 'user';
          token.tier = roleRow?.tier ?? 'free';
        } catch (e) {
          // Fail closed: do not issue a token that carries the wrong user id.
          logger.error('[auth] jwt callback failed to resolve user:', e);
          captureException(e instanceof Error ? e : new Error(String(e)), {
            context: 'jwt callback - resolve user',
          });
          throw e;
        }
      }

      return token;
    },

    async session({ session, token }) {
      const id = (token.sub || token.id) as string | undefined;
      if (session.user && id) {
        session.user.id = id;
        session.user.role = token.role;
        session.user.tier = token.tier;
      }
      return session;
    },
  },
};
