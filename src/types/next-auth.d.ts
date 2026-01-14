// src/types/next-auth.d.ts
import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role?: string;
      tier?: string;
      piWalletId?: string;
      piUsername?: string;
      piAccessToken?: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    name?: string;
    image?: string;
    password?: string;
    role?: string;
    tier?: string;
    piWalletId?: string;
    piUsername?: string;
    piAccessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    email: string;
    name?: string;
    picture?: string;
    role?: string;
    tier?: string;
    piAccessToken?: string;
    provider?: string;
  }
}
