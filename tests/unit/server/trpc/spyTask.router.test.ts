import { describe, expect, it } from 'vitest';
import { createCaller } from '@/server/trpc/routers/_app';
import { db } from '@/server/db';

async function createTestUser() {
  return db.user.create({ data: { email: `r-${Date.now()}-${Math.random()}@x.com`, passwordHash: 'x' } });
}

describe('spyTask router', () => {
  it('create returns a PENDING task and list shows it afterwards', async () => {
    const user = await createTestUser();
    const caller = createCaller({ userId: user.id });

    const created = await caller.spyTask.create({ keyword: 'hoodie' });
    expect(created.status).toBe('PENDING');

    const list = await caller.spyTask.list();
    expect(list.some((t) => t.id === created.id)).toBe(true);
  });

  it('getDetail throws for another user\'s task', async () => {
    const owner = await createTestUser();
    const stranger = await createTestUser();
    const ownerCaller = createCaller({ userId: owner.id });
    const strangerCaller = createCaller({ userId: stranger.id });

    const task = await ownerCaller.spyTask.create({ keyword: 'hoodie' });

    await expect(strangerCaller.spyTask.getDetail({ spyTaskId: task.id })).rejects.toThrow();
  });
});
