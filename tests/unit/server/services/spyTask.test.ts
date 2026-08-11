import { describe, expect, it } from 'vitest';
import { db } from '@/server/db';
import { mockSpyProvider } from '@/providers/spy/mock.adapter';
import { createSpyTask, persistResult } from '@/server/services/spyTask';

async function createTestUser() {
  return db.user.create({
    data: { email: `test-${Date.now()}-${Math.random()}@example.com`, passwordHash: 'x' },
  });
}

describe('createSpyTask', () => {
  it('creates a PENDING SpyTask and stores the providerTaskId', async () => {
    const user = await createTestUser();

    const task = await createSpyTask({ userId: user.id, keyword: 'hoodie', provider: mockSpyProvider });

    expect(task.status).toBe('PENDING');
    expect(task.userId).toBe(user.id);
    expect(task.providerTaskId).toBeTruthy();
  });
});

describe('persistResult', () => {
  it('inserts SpyTaskItem rows and marks the task SUCCEEDED, in one transaction', async () => {
    const user = await createTestUser();
    const task = await createSpyTask({ userId: user.id, keyword: 'hoodie', provider: mockSpyProvider });

    await persistResult({
      spyTaskId: task.id,
      items: [
        {
          externalId: '1',
          title: 'Hoodie',
          imageUrl: 'img',
          productUrl: 'url',
          price: 1290,
          currency: 'USD',
        },
      ],
    });

    const updated = await db.spyTask.findUniqueOrThrow({ where: { id: task.id } });
    expect(updated.status).toBe('SUCCEEDED');
    expect(updated.itemCount).toBe(1);

    const items = await db.spyTaskItem.findMany({ where: { spyTaskId: task.id } });
    expect(items).toHaveLength(1);
  });

  it('is idempotent — does not insert again if task already SUCCEEDED', async () => {
    const user = await createTestUser();
    const task = await createSpyTask({ userId: user.id, keyword: 'hoodie', provider: mockSpyProvider });
    const items = [
      { externalId: '1', title: 'A', imageUrl: 'i', productUrl: 'u', price: 100, currency: 'USD' },
    ];

    await persistResult({ spyTaskId: task.id, items });
    await persistResult({ spyTaskId: task.id, items }); // gọi lại lần 2, mô phỏng job retry

    const stored = await db.spyTaskItem.findMany({ where: { spyTaskId: task.id } });
    expect(stored).toHaveLength(1); // không nhân đôi
  });
});
