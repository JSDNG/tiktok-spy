import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    env: { USE_MOCK_SPY_PROVIDER: 'true', POLL_INITIAL_DELAY_MS: '1000' },
  },
  use: {
    baseURL: 'http://localhost:3000',
  },
});
