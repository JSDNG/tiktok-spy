import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/server/db';
import { verifyPassword } from '@/server/auth/password';
import { authConfig } from '@/server/auth/config';
import { env } from '@/lib/env';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: env.AUTH_SECRET, // trustHost đã kế thừa từ authConfig
  session: { strategy: 'jwt', maxAge: env.AUTH_SESSION_MAX_AGE },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== 'string' || typeof password !== 'string') return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.username ?? user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) {
        // authorize() ở trên luôn trả id — DefaultUser.id chỉ optional vì phải tương thích các adapter khác
        token.userId = user.id!;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId;
        session.user.role = token.role;
      }
      return session;
    },
  },
});
