import { describe, expect, it } from 'vitest';
import { createCaller } from '@/server/trpc/routers/_app';

describe('auth router', () => {
  it('registers a new user', async () => {
    const caller = createCaller({ userId: undefined, role: undefined });
    const email = `r-${Date.now()}@example.com`;

    const result = await caller.auth.register({ email, password: 'Password123' });

    expect(result.email).toBe(email);
  });

  it('rejects a weak password', async () => {
    const caller = createCaller({ userId: undefined, role: undefined });
    await expect(
      caller.auth.register({ email: `w-${Date.now()}@example.com`, password: 'short' }),
    ).rejects.toThrow();
  });

  it('returns CONFLICT for a duplicate email', async () => {
    const caller = createCaller({ userId: undefined, role: undefined });
    const email = `c-${Date.now()}@example.com`;
    await caller.auth.register({ email, password: 'Password123' });

    await expect(caller.auth.register({ email, password: 'Password123' })).rejects.toMatchObject({
      code: 'CONFLICT',
    });
  });
});
