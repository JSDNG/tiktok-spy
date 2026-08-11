import { notFound } from 'next/navigation';
import { getServerCaller } from '@/server/trpc/server';
import { TaskDetailView } from '@/features/history/TaskDetailView';

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caller = await getServerCaller();

  const detail = await caller.spyTask.getDetail({ spyTaskId: id }).catch(() => null);
  if (!detail) notFound();

  return <TaskDetailView spyTaskId={id} initialData={detail} />;
}
