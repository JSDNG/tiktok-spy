import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '@/server/auth/password';

describe('password', () => {
  it('hashes a password and verifies it correctly', async () => {
    const hash = await hashPassword('Password123');
    expect(hash).not.toBe('Password123');
    await expect(verifyPassword('Password123', hash)).resolves.toBe(true);
  });

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('Password123');
    await expect(verifyPassword('WrongPass1', hash)).resolves.toBe(false);
  });
});
