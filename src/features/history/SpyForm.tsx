'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/server/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SpyForm() {
  const [keyword, setKeyword] = useState('');
  const router = useRouter();
  const utils = trpc.useUtils();
  const createSpyTask = trpc.spyTask.create.useMutation({
    onSuccess: async (task) => {
      await utils.spyTask.list.invalidate();
      router.push(`/tasks/${task.id}`);
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (keyword.trim()) createSpyTask.mutate({ keyword: keyword.trim() });
        }}
      >
        <Input
          placeholder="Từ khoá"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          disabled={createSpyTask.isPending}
        />
        <Button type="submit" disabled={createSpyTask.isPending}>
          {createSpyTask.isPending ? 'Đang chạy...' : 'Spy'}
        </Button>
      </form>
      {createSpyTask.error ? (
        <p className="text-sm text-destructive">{createSpyTask.error.message}</p>
      ) : null}
    </div>
  );
}
