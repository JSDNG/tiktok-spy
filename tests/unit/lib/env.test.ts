import { describe, expect, it, vi } from 'vitest';

describe('env', () => {
  it('throws when a required var is missing', async () => {
    vi.resetModules();
    vi.stubEnv('DATABASE_URL', '');
    await expect(import('@/lib/env')).rejects.toThrow();
  });

  it('applies defaults for optional vars', async () => {
    vi.resetModules();
    vi.stubEnv('DATABASE_URL', 'postgresql://localhost/test');
    vi.stubEnv('REDIS_URL', 'redis://localhost:6379');
    vi.stubEnv('APIFY_TOKEN', 'token');
    vi.stubEnv('SEED_USER_EMAIL', 'devdragon@gmail.com');
    vi.stubEnv('SEED_USER_PASSWORD', 'DevDragon2026');
    vi.stubEnv('AUTH_SECRET', 'test-secret-at-least-32-chars-long');
    const { env } = await import('@/lib/env');
    expect(env.SPY_MAX_PRODUCTS).toBe(20);
    expect(env.APIFY_ACTOR_ID).toBe('devcake~tiktok-shop-data-scraper');
    expect(env.AUTH_SESSION_MAX_AGE).toBe(604800);
  });
});
