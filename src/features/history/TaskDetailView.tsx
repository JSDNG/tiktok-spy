'use client';

import type { inferRouterOutputs } from '@trpc/server';
import { trpc } from '@/server/trpc/client';
import type { AppRouter } from '@/server/trpc/routers/_app';
import { TaskItemsTable } from './TaskItemsTable';

type TaskDetail = inferRouterOutputs<AppRouter>['spyTask']['getDetail'];

export function TaskDetailView({
  spyTaskId,
  initialData,
}: {
  spyTaskId: string;
  initialData: TaskDetail;
}) {
  const { data } = trpc.spyTask.getDetail.useQuery(
    { spyTaskId },
    { initialData, refetchInterval: 2000 },
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">{data.task.keyword}</h1>
        <p className="text-sm text-muted-foreground">
          {data.task.status} · {data.task.itemCount} sản phẩm
          {data.task.error ? ` · ${data.task.error}` : ''}
        </p>
      </div>
      <TaskItemsTable items={data.items} />
    </div>
  );
}
