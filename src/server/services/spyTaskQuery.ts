import { db } from '@/server/db';

export function assertSpyTaskOwnership(
  spyTask: { userId: string } | null,
  userId: string,
): asserts spyTask is NonNullable<typeof spyTask> {
  if (!spyTask || spyTask.userId !== userId) {
    throw new Error('SpyTask not found');
  }
}

function keywordOf(spyTask: { params: unknown }): string {
  return (spyTask.params as { keyword: string }).keyword;
}

export async function listSpyTasks(params: { userId: string }) {
  const tasks = await db.spyTask.findMany({
    where: { userId: params.userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, status: true, itemCount: true, error: true, params: true },
  });

  return tasks.map((task) => ({
    id: task.id,
    status: task.status,
    itemCount: task.itemCount,
    error: task.error,
    keyword: keywordOf(task),
  }));
}

export async function getSpyTaskDetail(params: { userId: string; spyTaskId: string }) {
  const task = await db.spyTask.findUnique({
    where: { id: params.spyTaskId },
    select: { id: true, userId: true, status: true, itemCount: true, error: true, params: true },
  });
  assertSpyTaskOwnership(task, params.userId);

  const items = await db.spyTaskItem.findMany({
    where: { spyTaskId: task.id },
    select: {
      id: true,
      imageUrl: true,
      title: true,
      price: true,
      currency: true,
      soldCount: true,
      rating: true,
    },
  });

  return {
    task: {
      id: task.id,
      status: task.status,
      itemCount: task.itemCount,
      error: task.error,
      keyword: keywordOf(task),
    },
    items,
  };
}
