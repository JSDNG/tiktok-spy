import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  providers: [], // provider thật (Credentials) chỉ thêm ở config đầy đủ trong index.ts
  // proxy.ts tạo NextAuth instance RIÊNG từ authConfig này (không phải từ index.ts) — trustHost
  // phải đặt ở đây, không phải chỉ ở index.ts, nếu không proxy sẽ ném UntrustedHost sau nginx
  // reverse proxy (hoặc bất kỳ port/host nào khác 3000 nội bộ container).
  trustHost: true,
  callbacks: {
    // `config.matcher` trong proxy.ts đã giới hạn callback này chỉ chạy trên route cần bảo vệ
    // ('/' và '/tasks/*') — ở đây chỉ cần kiểm tra đã đăng nhập hay chưa.
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;
