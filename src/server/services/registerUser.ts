import { db } from '@/server/db';
import { hashPassword } from '@/server/auth/password';

export async function registerUser(params: { email: string; password: string; username?: string }) {
  const existingEmail = await db.user.findUnique({ where: { email: params.email } });
  if (existingEmail) throw new Error('Email đã được sử dụng');

  if (params.username) {
    const existingUsername = await db.user.findUnique({ where: { username: params.username } });
    if (existingUsername) throw new Error('Username đã được sử dụng');
  }

  const passwordHash = await hashPassword(params.password);
  const user = await db.user.create({
    data: { email: params.email, username: params.username, passwordHash },
    select: { id: true, email: true, username: true },
  });

  return user;
}
