import Link from 'next/link';
import { RegisterForm } from '@/features/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 pt-24">
      <h1 className="text-xl font-semibold">Đăng ký</h1>
      <RegisterForm />
      <p className="text-sm">
        Đã có tài khoản?{' '}
        <Link href="/login" className="underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
