'use server';

import { AuthError } from 'next-auth';
import { signIn } from '@/server/auth';

// Chỉ chấp nhận đường dẫn nội bộ tương đối ("/xyz") — callbackUrl đến từ query string
// do người dùng kiểm soát, nếu dùng thẳng làm redirectTo sẽ mở lỗ hổng open-redirect.
function sanitizeRedirect(value: FormDataEntryValue | null): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
}

export async function loginAction(_prevState: string | undefined, formData: FormData) {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: sanitizeRedirect(formData.get('callbackUrl')),
    });
  } catch (error) {
    if (error instanceof AuthError) return 'Email hoặc mật khẩu không đúng';
    throw error;
  }
}
