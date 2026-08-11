'use client';

import Link from 'next/link';
import { trpc } from '@/server/trpc/client';
import { cn } from '@/lib/utils';

export function TaskHistorySidebar() {
  const { data: tasks } = trpc.spyTask.list.useQuery(undefined, { refetchInterval: 2000 });

  return (
    <nav className="flex h-full flex-1 flex-col gap-1 overflow-y-auto p-3">
      <Link href="/" className="mb-2 rounded px-2 py-1.5 text-sm font-medium hover:bg-muted">
        + Spy mới
      </Link>
      {tasks?.map((task) => (
        <Link
          key={task.id}
          href={`/tasks/${task.id}`}
          className="rounded px-2 py-1.5 text-sm hover:bg-muted"
        >
          <div className="truncate font-medium">{task.keyword}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className={cn(
                'rounded px-1',
                task.status === 'SUCCEEDED' && 'bg-green-100 text-green-700',
                task.status === 'FAILED' && 'bg-red-100 text-red-700',
                task.status === 'TIMEOUT' && 'bg-red-100 text-red-700',
                (task.status === 'PENDING' || task.status === 'RUNNING') &&
                  'bg-yellow-100 text-yellow-700',
              )}
            >
              {task.status}
            </span>
            <span>{task.itemCount} sản phẩm</span>
          </div>
        </Link>
      ))}
    </nav>
  );
}
