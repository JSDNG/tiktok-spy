'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/server/trpc/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const register = trpc.auth.register.useMutation({
    onSuccess: () => router.push('/login'),
  });

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        register.mutate({ email, password, username: username || undefined });
      }}
    >
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <Input
        placeholder="Username (tuỳ chọn)"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
      />
      <Input
        type="password"
        placeholder="Mật khẩu"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      {register.error ? <p className="text-sm text-destructive">{register.error.message}</p> : null}
      <Button type="submit" disabled={register.isPending}>
        Đăng ký
      </Button>
    </form>
  );
}
