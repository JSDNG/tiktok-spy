import { describe, expect, it } from 'vitest';
import { db } from '@/server/db';
import { mockSpyProvider } from '@/providers/spy/mock.adapter';
import { createSpyTask } from '@/server/services/spyTask';
import { assertSpyTaskOwnership, getSpyTaskDetail, listSpyTasks } from '@/server/services/spyTaskQuery';

async function createTestUser() {
  return db.user.create({ data: { email: `t-${Date.now()}-${Math.random()}@x.com`, passwordHash: 'x' } });
}

describe('assertSpyTaskOwnership', () => {
  it('throws when spyTask is null', () => {
    expect(() => assertSpyTaskOwnership(null, 'user-1')).toThrow();
  });

  it('throws when userId does not match', () => {
    expect(() => assertSpyTaskOwnership({ userId: 'other-user' }, 'user-1')).toThrow();
  });

  it('does not throw when userId matches', () => {
    expect(() => assertSpyTaskOwnership({ userId: 'user-1' }, 'user-1')).not.toThrow();
  });
});

describe('listSpyTasks', () => {
  it('returns only tasks belonging to the given user, newest first', async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();
    const taskA = await createSpyTask({ userId: userA.id, keyword: 'a', provider: mockSpyProvider });
    await createSpyTask({ userId: userB.id, keyword: 'b', provider: mockSpyProvider });

    const result = await listSpyTasks({ userId: userA.id });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(taskA.id);
    expect(result[0].keyword).toBe('a');
  });
});

describe('getSpyTaskDetail', () => {
  it('throws when the task belongs to a different user', async () => {
    const owner = await createTestUser();
    const stranger = await createTestUser();
    const task = await createSpyTask({ userId: owner.id, keyword: 'a', provider: mockSpyProvider });

    await expect(getSpyTaskDetail({ userId: stranger.id, spyTaskId: task.id })).rejects.toThrow();
  });
});
