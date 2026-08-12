'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [error, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? '/'} />
      <Input name="email" type="email" placeholder="Email" required />
      <Input name="password" type="password" placeholder="Mật khẩu" required />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        Đăng nhập
      </Button>
    </form>
  );
}
