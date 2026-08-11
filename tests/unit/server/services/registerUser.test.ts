import { describe, expect, it } from 'vitest';
import { db } from '@/server/db';
import { registerUser } from '@/server/services/registerUser';

describe('registerUser', () => {
  it('creates a user with a hashed password', async () => {
    const email = `u-${Date.now()}@example.com`;
    const user = await registerUser({ email, password: 'Password123' });

    expect(user.email).toBe(email);
    const stored = await db.user.findUniqueOrThrow({ where: { email } });
    expect(stored.passwordHash).not.toBe('Password123');
  });

  it('rejects a duplicate email', async () => {
    const email = `dup-${Date.now()}@example.com`;
    await registerUser({ email, password: 'Password123' });
    await expect(registerUser({ email, password: 'Password123' })).rejects.toThrow();
  });

  it('rejects a duplicate username', async () => {
    const username = `user${Date.now()}`;
    await registerUser({ email: `a-${Date.now()}@example.com`, password: 'Password123', username });
    await expect(
      registerUser({ email: `b-${Date.now()}@example.com`, password: 'Password123', username }),
    ).rejects.toThrow();
  });
});
