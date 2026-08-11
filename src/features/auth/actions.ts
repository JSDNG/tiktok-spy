'use server';

import { AuthError } from 'next-auth';
import { signIn } from '@/server/auth';

export async function loginAction(_prevState: string | undefined, formData: FormData) {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/',
    });
  } catch (error) {
    if (error instanceof AuthError) return 'Email hoặc mật khẩu không đúng';
    throw error;
  }
}
