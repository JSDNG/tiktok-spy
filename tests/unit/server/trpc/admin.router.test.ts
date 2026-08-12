import { describe, expect, it } from 'vitest';
import { createCaller } from '@/server/trpc/routers/_app';
import { db } from '@/server/db';

async function createTestUser(role: 'USER' | 'ADMIN' = 'USER') {
  return db.user.create({
    data: { email: `admin-router-${Date.now()}-${Math.random()}@x.com`, passwordHash: 'x', role },
  });
}

describe('admin router', () => {
  it('rejects USER role with FORBIDDEN', async () => {
    const user = await createTestUser('USER');
    const caller = createCaller({ userId: user.id, role: user.role });

    await expect(caller.admin.overview({})).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('rejects unauthenticated context with UNAUTHORIZED', async () => {
    const caller = createCaller({ userId: undefined, role: undefined });

    await expect(caller.admin.overview({})).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('allows ADMIN role and returns overview stats', async () => {
    const admin = await createTestUser('ADMIN');
    const caller = createCaller({ userId: admin.id, role: admin.role });

    const overview = await caller.admin.overview({});

    expect(overview).toMatchObject({ totalUsers: expect.any(Number), totalTasks: expect.any(Number) });
  });
});
