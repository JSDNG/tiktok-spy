import { notFound } from 'next/navigation';
import { getServerCaller } from '@/server/trpc/server';
import { TaskItemsTable } from '@/features/history/TaskItemsTable';

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caller = await getServerCaller();

  const detail = await caller.spyTask.getDetail({ spyTaskId: id }).catch(() => null);
  if (!detail) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">{detail.task.keyword}</h1>
        <p className="text-sm text-muted-foreground">
          {detail.task.status} · {detail.task.itemCount} sản phẩm
          {detail.task.error ? ` · ${detail.task.error}` : ''}
        </p>
      </div>
      <TaskItemsTable items={detail.items} />
    </div>
  );
}
