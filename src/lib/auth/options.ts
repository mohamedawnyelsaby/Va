// src/lib/auth/options.ts
//
// Pi Network is the ONLY sign-in method (Pi Mainnet listing requirement: "Use
// Only Pi Authentication"). There is deliberately no email/password provider
// and no Google/OAuth provider here, so those flows cannot be reached through
// /api/auth/callback/* either.
//
// SECURITY NOTES
// 1) The 'pi-network' provider never trusts the client-supplied `uid` /
//    `accessToken`. It verifies the token against Pi's /v2/me and requires the
//    returned uid to match.
// 2) Pi access tokens are not persisted in the database.
// 3) role / tier are exposed on the session for UI use. Authorization
//    decisions on the server must still re-read the role from the DB.

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';
import { captureException } from '@/lib/monitoring/sentry';
import { verifyPiUser } from '@/lib/pi-network/platform-api';
import { getVerifiedToken, rememberVerifiedToken } from '@/lib/pi-network/verified-token-cache';
import { logger } from '@/lib/logger';
import { sessionVersion } from '@/lib/auth/session-version';

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
  // Cookies. In production they are SameSite=None; Secure because Pi Browser
  // runs the app embedded (Testnet apps open inside sandbox.minepi.com), and a
  // SameSite=Lax cookie is not sent/kept in that cross-site context - sign-in
  // would "succeed" and the very next page would still see no session.
  // Cross-site request forgery is covered separately: src/middleware.ts
  // rejects any API request whose Origin is not the app itself or an
  // allowlisted origin (403), and NextAuth's own endpoints need a CSRF token.
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.callback-url'
        : 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Host-next-auth.csrf-token'
        : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  providers: [
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

        // Short, non-sensitive reason codes (shown on the sign-in screen).
        // NextAuth returns the thrown message as `error`; none of these reveal
        // anything an attacker does not already know from the response itself.
        let piUid: string;
        let piUsernameRaw: string;
        try {
          // ✅ The ONLY source of truth for who this is: Pi Network itself.
          // A token already verified moments ago in /api/auth/pi/verify is
          // reused (same token + same uid, 5 min); otherwise ask Pi now.
          // The client-supplied uid/username are never trusted on their own.
          const known = getVerifiedToken(credentials.accessToken, credentials.uid);
          if (known) {
            logger.log('[auth] pi-network authorize: token cache hit');
            piUid = known.uid;
            piUsernameRaw = known.username;
          } else {
            logger.log('[auth] pi-network authorize: cache miss, asking Pi');
            const piUser = await verifyPiUser(credentials.accessToken);
            piUid = piUser?.uid ?? '';
            piUsernameRaw = String(piUser?.username || piUser?.uid || '');
            if (piUid && piUid === credentials.uid) {
              rememberVerifiedToken(credentials.accessToken, piUid, piUsernameRaw);
            }
          }
        } catch (e) {
          // Pi API failure/timeout: fail closed, never fall back to the client.
          logger.error('[auth] Pi verification failed:', e instanceof Error ? e.message : e);
          // Pi down / slow / rate limited is transient and not the user's
          // fault: report it distinctly from a rejected token.
          throw new Error(
            e instanceof Error && e.message === 'Pi service unavailable' ? 'PiServerError' : 'PiVerifyFailed'
          );
        }

        if (!piUid || piUid !== credentials.uid) {
          logger.warn('[auth] Pi sign-in rejected: uid mismatch');
          throw new Error('PiUidMismatch');
        }

        try {
          const piUsername = (piUsernameRaw || piUid).slice(0, 100);

          const user = await prisma.user.upsert({
            where: { piWalletId: piUid },
            update: { piUsername },
            create: {
              email: `${piUid}@pi.network`,
              piWalletId: piUid,
              piUsername,
              name: piUsername,
              emailVerified: new Date(),
            },
          });

          if (!user.isActive) {
            throw new Error('AccountInactive');
          }

          logger.log('[auth] pi-network authorize: ok');
          return { id: user.id, name: user.name ?? undefined, email: user.email };
        } catch (e) {
          if (e instanceof Error && e.message === 'AccountInactive') {throw e;}
          logger.error('[auth] Pi authorize database error:', e instanceof Error ? e.message : e);
          captureException(e instanceof Error ? e : new Error(String(e)), {
            context: 'pi-network credentials authorize',
          });
          throw new Error('PiServerError');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Every token read after sign-in: make sure the account is still valid.
      // Throwing here makes NextAuth clear the cookie and treat the request
      // as signed-out (getServerSession() -> null), which is what revokes:
      //   - deactivated / deleted accounts (previously good for 30 days),
      //   - sessions that predate a password change or reset.
      if (!user && token.id) {
        const current = await prisma.user.findUnique({
          where: { id: token.id },
          select: { isActive: true, password: true },
        });
        if (!current || !current.isActive) {
          throw new Error('SESSION_REVOKED');
        }
        const currentVersion = sessionVersion(current.password);
        if (token.sv === undefined) {
          // Token issued before this check existed: adopt the current state
          // once instead of logging every existing user out at deploy time.
          token.sv = currentVersion;
        } else if (token.sv !== currentVersion) {
          throw new Error('SESSION_REVOKED');
        }
        return token;
      }

      if (user) {
        token.sub = user.id;
        token.id = user.id;
      }

      // Sign-in time only (`user` is undefined on later token refreshes).
      if (user) {
        try {
          const roleRow = await prisma.user.findUnique({
            where: { id: token.id },
            select: { role: true, tier: true, password: true },
          });
          token.role = roleRow?.role ?? 'user';
          token.tier = roleRow?.tier ?? 'free';
          token.sv = sessionVersion(roleRow?.password);
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
