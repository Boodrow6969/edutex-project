import type { NextAuthConfig } from 'next-auth';
import type { Adapter } from '@auth/core/adapters';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';

// Create adapter lazily to avoid Prisma v7 initialization issues during build
let _adapter: Adapter | undefined;
const getAdapter = (): Adapter | undefined => {
  // Return cached adapter if already created
  if (_adapter) return _adapter;

  // Skip adapter during build (no runtime environment)
  if (typeof process === 'undefined') return undefined;

  try {
    // Dynamically require to avoid module resolution during static analysis
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaAdapter } = require('@auth/prisma-adapter');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const prisma = require('./lib/prisma').default;
    _adapter = PrismaAdapter(prisma);
    return _adapter;
  } catch {
    // If Prisma isn't available (e.g., during build), return undefined
    console.warn('Prisma adapter not available during build');
    return undefined;
  }
};

export const authConfig: NextAuthConfig = {
  adapter: getAdapter(),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    // Microsoft can be added later
    // Azure({
    //   clientId: process.env.MICROSOFT_CLIENT_ID,
    //   clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    //   tenantId: process.env.MICROSOFT_TENANT_ID,
    // }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/workspace');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/workspace', nextUrl));
      }
      return true;
    },
  },
  session: {
    strategy: 'jwt',
  },
} satisfies NextAuthConfig;
