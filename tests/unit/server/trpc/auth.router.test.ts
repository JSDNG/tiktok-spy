import { describe, expect, it } from 'vitest';
import { createCaller } from '@/server/trpc/routers/_app';

describe('auth router', () => {
  it('registers a new user', async () => {
    const caller = createCaller({ userId: undefined, role: undefined });
    const email = `r-${Date.now()}@example.com`;

    const result = await caller.auth.register({ email, password: 'Password123' });

    expect(result.email).toBe(email);
  });

  it('rejects a weak password with a specific, human-readable reason', async () => {
    const caller = createCaller({ userId: undefined, role: undefined });
    await expect(
      caller.auth.register({ email: `w-${Date.now()}@example.com`, password: 'short' }),
    ).rejects.toMatchObject({
      message: expect.stringContaining('Mật khẩu phải có ít nhất 8 ký tự'),
    });
  });

  it('reports missing digit and missing letter separately, not a generic "Invalid"', async () => {
    const caller = createCaller({ userId: undefined, role: undefined });

    await expect(
      caller.auth.register({ email: `w-${Date.now()}-1@example.com`, password: 'onlyletters' }),
    ).rejects.toMatchObject({ message: expect.stringContaining('Mật khẩu phải chứa ít nhất 1 chữ số') });

    await expect(
      caller.auth.register({ email: `w-${Date.now()}-2@example.com`, password: '12345678' }),
    ).rejects.toMatchObject({ message: expect.stringContaining('Mật khẩu phải chứa ít nhất 1 chữ cái') });
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
