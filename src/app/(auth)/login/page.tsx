import Link from 'next/link';
import { LoginForm } from '@/features/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 pt-24">
      <h1 className="text-xl font-semibold">Đăng nhập</h1>
      <LoginForm />
      <p className="text-sm">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="underline">
          Đăng ký
        </Link>
      </p>
    </div>
  );
}
