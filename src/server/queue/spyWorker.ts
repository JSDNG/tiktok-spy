import { DelayedError } from 'bullmq';
import { db } from '@/server/db';
import { env } from '@/lib/env';
import { persistResult } from '@/server/services/spyTask';
import type { SpyProvider } from '@/providers/spy/types';

interface PollJob {
  data: { spyTaskId: string };
  moveToDelayed: (timestamp: number, token?: string) => Promise<void>;
}

export async function processPollJob(job: PollJob, deps: { provider: SpyProvider }) {
  const task = await db.spyTask.findUniqueOrThrow({ where: { id: job.data.spyTaskId } });

  if (task.status === 'SUCCEEDED' || task.status === 'FAILED' || task.status === 'TIMEOUT') {
    return;
  }

  if (Date.now() - task.createdAt.getTime() > env.POLL_TIMEOUT_MS) {
    await db.spyTask.update({
      where: { id: task.id },
      data: { status: 'TIMEOUT', error: 'Polling timed out', finishedAt: new Date() },
    });
    return;
  }

  const result = await deps.provider.fetchResult(task.providerTaskId);

  if (result.status === 'FAILED') {
    await db.spyTask.update({
      where: { id: task.id },
      data: { status: 'FAILED', error: result.errorMessage, finishedAt: new Date() },
    });
    return;
  }

  if (result.status === 'SUCCEEDED') {
    await persistResult({ spyTaskId: task.id, items: result.items });
    return;
  }

  // result.status is 'PENDING' | 'RUNNING' — actor chưa xong, poll lại sau.
  await job.moveToDelayed(Date.now() + env.POLL_INTERVAL_MS);
  throw new DelayedError();
}
