import { describe, expect, it, vi } from 'vitest';
import { db } from '@/server/db';
import { mockSpyProvider } from '@/providers/spy/mock.adapter';
import { createSpyTask } from '@/server/services/spyTask';
import { processPollJob } from '@/server/queue/spyWorker';

async function createTestUser() {
  return db.user.create({ data: { email: `w-${Date.now()}-${Math.random()}@x.com`, passwordHash: 'x' } });
}

describe('processPollJob', () => {
  it('persists items and marks SUCCEEDED when provider returns SUCCEEDED', async () => {
    const user = await createTestUser();
    const task = await createSpyTask({ userId: user.id, keyword: 'hoodie', provider: mockSpyProvider });
    const fakeJob = { data: { spyTaskId: task.id }, moveToDelayed: vi.fn() };

    await processPollJob(fakeJob, { provider: mockSpyProvider });

    const updated = await db.spyTask.findUniqueOrThrow({ where: { id: task.id } });
    expect(updated.status).toBe('SUCCEEDED');
  });

  it('calls moveToDelayed and throws DelayedError when still RUNNING', async () => {
    const user = await createTestUser();
    const task = await createSpyTask({ userId: user.id, keyword: 'hoodie', provider: mockSpyProvider });
    const runningProvider = {
      ...mockSpyProvider,
      fetchResult: vi.fn().mockResolvedValue({ status: 'RUNNING' as const }),
    };
    const fakeJob = { data: { spyTaskId: task.id }, moveToDelayed: vi.fn() };

    await expect(processPollJob(fakeJob, { provider: runningProvider })).rejects.toThrow();
    expect(fakeJob.moveToDelayed).toHaveBeenCalled();
  });

  it('marks TIMEOUT when POLL_TIMEOUT_MS has elapsed since createdAt', async () => {
    const user = await createTestUser();
    const task = await createSpyTask({ userId: user.id, keyword: 'hoodie', provider: mockSpyProvider });
    await db.spyTask.update({
      where: { id: task.id },
      data: { createdAt: new Date(Date.now() - 999_999_999) },
    });
    const runningProvider = {
      ...mockSpyProvider,
      fetchResult: vi.fn().mockResolvedValue({ status: 'RUNNING' as const }),
    };
    const fakeJob = { data: { spyTaskId: task.id }, moveToDelayed: vi.fn() };

    await processPollJob(fakeJob, { provider: runningProvider });

    const updated = await db.spyTask.findUniqueOrThrow({ where: { id: task.id } });
    expect(updated.status).toBe('TIMEOUT');
  });

  it('marks FAILED when provider returns FAILED', async () => {
    const user = await createTestUser();
    const task = await createSpyTask({ userId: user.id, keyword: 'hoodie', provider: mockSpyProvider });
    const failedProvider = {
      ...mockSpyProvider,
      fetchResult: vi.fn().mockResolvedValue({ status: 'FAILED' as const, errorMessage: 'boom' }),
    };
    const fakeJob = { data: { spyTaskId: task.id }, moveToDelayed: vi.fn() };

    await processPollJob(fakeJob, { provider: failedProvider });

    const updated = await db.spyTask.findUniqueOrThrow({ where: { id: task.id } });
    expect(updated.status).toBe('FAILED');
    expect(updated.error).toBe('boom');
  });

  it('is a no-op when the task is already in a terminal state', async () => {
    const user = await createTestUser();
    const task = await createSpyTask({ userId: user.id, keyword: 'hoodie', provider: mockSpyProvider });
    await db.spyTask.update({ where: { id: task.id }, data: { status: 'SUCCEEDED' } });
    const spyProvider = { ...mockSpyProvider, fetchResult: vi.fn() };
    const fakeJob = { data: { spyTaskId: task.id }, moveToDelayed: vi.fn() };

    await processPollJob(fakeJob, { provider: spyProvider });

    expect(spyProvider.fetchResult).not.toHaveBeenCalled();
  });
});
