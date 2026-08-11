import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  providers: [], // provider thật (Credentials) chỉ thêm ở config đầy đủ trong index.ts
  callbacks: {
    // `config.matcher` trong proxy.ts đã giới hạn callback này chỉ chạy trên route cần bảo vệ
    // ('/' và '/tasks/*') — ở đây chỉ cần kiểm tra đã đăng nhập hay chưa.
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;
