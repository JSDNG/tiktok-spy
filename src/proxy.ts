import NextAuth from 'next-auth';
import { authConfig } from '@/server/auth/config';

const { auth } = NextAuth(authConfig);

export const proxy = auth;

export const config = {
  matcher: ['/', '/tasks/:path*', '/admin/:path*'],
};
