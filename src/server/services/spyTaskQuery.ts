import { db } from '@/server/db';

export function assertSpyTaskOwnership(
  spyTask: { userId: string } | null,
  userId: string,
): asserts spyTask is NonNullable<typeof spyTask> {
  if (!spyTask || spyTask.userId !== userId) {
    throw new Error('SpyTask not found');
  }
}

export async function listSpyTasks(params: { userId: string }) {
  return db.spyTask.findMany({
    where: { userId: params.userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getSpyTaskDetail(params: { userId: string; spyTaskId: string }) {
  const task = await db.spyTask.findUnique({ where: { id: params.spyTaskId } });
  assertSpyTaskOwnership(task, params.userId);

  const items = await db.spyTaskItem.findMany({ where: { spyTaskId: task.id } });
  return { task, items };
}
