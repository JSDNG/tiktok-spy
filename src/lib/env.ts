import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  APIFY_TOKEN: z.string().min(1),
  APIFY_ACTOR_ID: z.string().default('devcake~tiktok-shop-data-scraper'),
  SPY_DEFAULT_CURRENCY: z.string().default('USD'),
  SPY_MAX_PRODUCTS: z.coerce.number().int().positive().default(20),
  POLL_INITIAL_DELAY_MS: z.coerce.number().int().positive().default(20000),
  POLL_INTERVAL_MS: z.coerce.number().int().positive().default(10000),
  POLL_TIMEOUT_MS: z.coerce.number().int().positive().default(180000),
  SEED_USER_EMAIL: z.string().email(),
  SEED_USER_PASSWORD: z.string().min(8),
});

export const env = schema.parse(process.env);
