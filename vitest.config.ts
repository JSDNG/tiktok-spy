import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    env: { USE_MOCK_SPY_PROVIDER: 'true' },
    include: ['tests/unit/**/*.test.ts'],
    server: {
      // next-auth/next expect resolution as done by Next.js's own bundler (extensionless
      // `next/server` imports) — inline chúng để Vite transform thay vì Node ESM thuần.
      deps: { inline: [/next-auth/, /^next$/] },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
});
