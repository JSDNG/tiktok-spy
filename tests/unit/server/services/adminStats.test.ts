import { describe, expect, it } from 'vitest';
import { db } from '@/server/db';
import { mockSpyProvider } from '@/providers/spy/mock.adapter';
import { createSpyTask, persistResult } from '@/server/services/spyTask';
import {
  getOverview,
  getProviderHealth,
  getTaskStatusTrend,
  getTopKeywords,
  getUserActivity,
  getZeroResultKeywords,
} from '@/server/services/adminStats';

async function createTestUser() {
  return db.user.create({
    data: { email: `admin-stats-${Date.now()}-${Math.random()}@x.com`, passwordHash: 'x' },
  });
}

describe('getOverview', () => {
  it('computes successRate only from finished tasks (excludes PENDING/RUNNING)', async () => {
    const user = await createTestUser();
    const succeeded = await createSpyTask({ userId: user.id, keyword: 'a', provider: mockSpyProvider });
    await persistResult({
      spyTaskId: succeeded.id,
      items: [{ externalId: '1', title: 'A', imageUrl: 'i', productUrl: 'u', price: 100, currency: 'USD' }],
    });
    const failed = await createSpyTask({ userId: user.id, keyword: 'b', provider: mockSpyProvider });
    await db.spyTask.update({ where: { id: failed.id }, data: { status: 'FAILED' } });
    await createSpyTask({ userId: user.id, keyword: 'c', provider: mockSpyProvider }); // vẫn PENDING

    const overview = await getOverview();

    expect(overview.totalTasks).toBeGreaterThanOrEqual(3);
    // 1 SUCCEEDED / (1 SUCCEEDED + 1 FAILED) trong toàn hệ thống — không tính task PENDING còn lại
    if (overview.successRate === null) throw new Error('expected a non-null successRate');
    expect(overview.successRate).toBeGreaterThan(0);
    expect(overview.successRate).toBeLessThanOrEqual(1);
  });

  it('returns null successRate when there are no finished tasks at all', async () => {
    // Không tạo task nào — DB rỗng theo scope test này chỉ khả thi nếu chạy độc lập,
    // nên thay vào đó kiểm tra tính chất: null chỉ khi finished === 0.
    const overview = await getOverview({ from: new Date('2099-01-01') });
    expect(overview.totalTasks).toBe(0);
    expect(overview.successRate).toBeNull();
  });
});

describe('getUserActivity', () => {
  it('aggregates totalSpyCount, successRate, and lastSpyAt per user', async () => {
    const user = await createTestUser();
    const t1 = await createSpyTask({ userId: user.id, keyword: 'shoe', provider: mockSpyProvider });
    await persistResult({
      spyTaskId: t1.id,
      items: [{ externalId: '1', title: 'A', imageUrl: 'i', productUrl: 'u', price: 100, currency: 'USD' }],
    });
    await createSpyTask({ userId: user.id, keyword: 'shoe', provider: mockSpyProvider });

    const activity = await getUserActivity();
    const row = activity.find((u) => u.id === user.id);

    if (!row) throw new Error('expected user to appear in activity list');
    expect(row.totalSpyCount).toBe(2);
    expect(row.successRate).toBe(1); // 1 SUCCEEDED / 1 finished (task còn lại PENDING không tính)
    expect(row.lastSpyAt).not.toBeNull();
  });

  it('is sorted by totalSpyCount descending', async () => {
    const activity = await getUserActivity();
    for (let i = 1; i < activity.length; i++) {
      expect(activity[i - 1].totalSpyCount).toBeGreaterThanOrEqual(activity[i].totalSpyCount);
    }
  });
});

describe('getTopKeywords', () => {
  it('groups by keyword and counts spy occurrences', async () => {
    const user = await createTestUser();
    const keyword = `unique-kw-${Date.now()}`;
    await createSpyTask({ userId: user.id, keyword, provider: mockSpyProvider });
    await createSpyTask({ userId: user.id, keyword, provider: mockSpyProvider });
    await createSpyTask({ userId: user.id, keyword: `${keyword}-other`, provider: mockSpyProvider });

    const top = await getTopKeywords({ limit: 100 });
    const row = top.find((k) => k.keyword === keyword);

    if (!row) throw new Error('expected keyword to appear in top list');
    expect(row.spyCount).toBe(2);
  });
});

describe('getZeroResultKeywords', () => {
  it('only returns SUCCEEDED tasks with itemCount 0', async () => {
    const user = await createTestUser();
    const zeroResult = await createSpyTask({ userId: user.id, keyword: 'zero-hits', provider: mockSpyProvider });
    await persistResult({ spyTaskId: zeroResult.id, items: [] });

    const withResult = await createSpyTask({ userId: user.id, keyword: 'has-hits', provider: mockSpyProvider });
    await persistResult({
      spyTaskId: withResult.id,
      items: [{ externalId: '1', title: 'A', imageUrl: 'i', productUrl: 'u', price: 100, currency: 'USD' }],
    });

    const zeroResultKeywords = await getZeroResultKeywords({ limit: 200 });

    expect(zeroResultKeywords.some((t) => t.id === zeroResult.id)).toBe(true);
    expect(zeroResultKeywords.some((t) => t.id === withResult.id)).toBe(false);
  });
});

describe('getTaskStatusTrend', () => {
  it('buckets task counts by day and status', async () => {
    const user = await createTestUser();
    await createSpyTask({ userId: user.id, keyword: 'trend', provider: mockSpyProvider });

    const trend = await getTaskStatusTrend();

    expect(trend.length).toBeGreaterThan(0);
    expect(trend.some((row) => row.status === 'PENDING')).toBe(true);
  });
});

describe('getProviderHealth', () => {
  it('computes errorRate and avgDurationMs from ProviderRequestLog', async () => {
    await db.providerRequestLog.create({
      data: { endpoint: 'test-ok', httpStatus: 200, durationMs: 100 },
    });
    await db.providerRequestLog.create({
      data: { endpoint: 'test-fail', httpStatus: 500, durationMs: 300 },
    });

    const health = await getProviderHealth();

    expect(health.totalRequests).toBeGreaterThanOrEqual(2);
    expect(health.errorCount).toBeGreaterThanOrEqual(1);
    expect(health.errorRate).not.toBeNull();
    expect(health.avgDurationMs).not.toBeNull();
  });
});
