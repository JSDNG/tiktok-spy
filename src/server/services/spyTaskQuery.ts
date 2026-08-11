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
  });

  return tasks.map((task) => ({
    id: task.id,
    status: task.status,
    itemCount: task.itemCount,
    error: task.error,
    createdAt: task.createdAt,
    keyword: keywordOf(task),
  }));
}

export async function getSpyTaskDetail(params: { userId: string; spyTaskId: string }) {
  const task = await db.spyTask.findUnique({ where: { id: params.spyTaskId } });
  assertSpyTaskOwnership(task, params.userId);

  const items = await db.spyTaskItem.findMany({ where: { spyTaskId: task.id } });

  return {
    task: {
      id: task.id,
      status: task.status,
      itemCount: task.itemCount,
      error: task.error,
      createdAt: task.createdAt,
      keyword: keywordOf(task),
    },
    items,
  };
}
