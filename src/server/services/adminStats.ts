import { db } from '@/server/db';
import type { SpyTaskStatus } from '@prisma/client';

export interface DateRange {
  from?: Date;
  to?: Date;
}

const FINISHED_STATUSES: SpyTaskStatus[] = ['SUCCEEDED', 'FAILED', 'TIMEOUT'];

function createdAtWhere(range: DateRange) {
  if (!range.from && !range.to) return undefined;
  return { ...(range.from ? { gte: range.from } : {}), ...(range.to ? { lte: range.to } : {}) };
}

export async function getOverview(range: DateRange = {}) {
  const where = createdAtWhere(range) ? { createdAt: createdAtWhere(range) } : undefined;

  const [totalUsers, totalTasks, statusGroups] = await Promise.all([
    db.user.count(),
    db.spyTask.count({ where }),
    db.spyTask.groupBy({ by: ['status'], where, _count: { _all: true } }),
  ]);

  const succeeded = statusGroups.find((g) => g.status === 'SUCCEEDED')?._count._all ?? 0;
  const finished = statusGroups
    .filter((g) => FINISHED_STATUSES.includes(g.status))
    .reduce((sum, g) => sum + g._count._all, 0);

  return {
    totalUsers,
    totalTasks,
    successRate: finished === 0 ? null : succeeded / finished,
    statusBreakdown: statusGroups.map((g) => ({ status: g.status, count: g._count._all })),
  };
}

export async function getUserActivity(range: DateRange = {}) {
  const where = createdAtWhere(range) ? { createdAt: createdAtWhere(range) } : undefined;

  const [users, statusGroups] = await Promise.all([
    db.user.findMany({
      select: { id: true, email: true, username: true, role: true, createdAt: true },
    }),
    db.spyTask.groupBy({
      by: ['userId', 'status'],
      where,
      _count: { _all: true },
      _max: { createdAt: true },
    }),
  ]);

  const byUser = new Map<
    string,
    { total: number; succeeded: number; finished: number; lastSpyAt: Date | null }
  >();
  for (const row of statusGroups) {
    const entry = byUser.get(row.userId) ?? { total: 0, succeeded: 0, finished: 0, lastSpyAt: null };
    entry.total += row._count._all;
    if (row.status === 'SUCCEEDED') entry.succeeded += row._count._all;
    if (FINISHED_STATUSES.includes(row.status)) entry.finished += row._count._all;
    if (row._max.createdAt && (!entry.lastSpyAt || row._max.createdAt > entry.lastSpyAt)) {
      entry.lastSpyAt = row._max.createdAt;
    }
    byUser.set(row.userId, entry);
  }

  return users
    .map((user) => {
      const stats = byUser.get(user.id) ?? { total: 0, succeeded: 0, finished: 0, lastSpyAt: null };
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        totalSpyCount: stats.total,
        successRate: stats.finished === 0 ? null : stats.succeeded / stats.finished,
        lastSpyAt: stats.lastSpyAt,
      };
    })
    .sort((a, b) => b.totalSpyCount - a.totalSpyCount);
}

export async function getTopKeywords(params: DateRange & { limit?: number } = {}) {
  const where = createdAtWhere(params) ? { createdAt: createdAtWhere(params) } : undefined;
  const limit = params.limit ?? 20;

  const grouped = await db.spyTask.groupBy({
    by: ['keyword'],
    where,
    _count: { _all: true },
    _sum: { itemCount: true },
    orderBy: { _count: { id: 'desc' } },
    take: limit,
  });

  return grouped.map((g) => ({
    keyword: g.keyword,
    spyCount: g._count._all,
    totalItemsFound: g._sum.itemCount ?? 0,
  }));
}

export async function getZeroResultKeywords(params: DateRange & { limit?: number } = {}) {
  const where = createdAtWhere(params) ? { createdAt: createdAtWhere(params) } : undefined;
  const limit = params.limit ?? 50;

  return db.spyTask.findMany({
    where: { ...where, status: 'SUCCEEDED', itemCount: 0 },
    select: { id: true, keyword: true, createdAt: true, userId: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getTaskStatusTrend(range: DateRange = {}) {
  const from = range.from ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to = range.to ?? new Date();

  const rows = await db.$queryRaw<{ day: Date; status: SpyTaskStatus; count: bigint }[]>`
    SELECT date_trunc('day', "createdAt") AS day, status, COUNT(*)::bigint AS count
    FROM "SpyTask"
    WHERE "createdAt" >= ${from} AND "createdAt" <= ${to}
    GROUP BY 1, 2
    ORDER BY 1 ASC
  `;

  return rows.map((r) => ({ day: r.day, status: r.status, count: Number(r.count) }));
}

export async function getProviderHealth(range: DateRange = {}) {
  const where = createdAtWhere(range) ? { createdAt: createdAtWhere(range) } : undefined;

  const [total, errorCount, avgDuration, statusGroups] = await Promise.all([
    db.providerRequestLog.count({ where }),
    db.providerRequestLog.count({ where: { ...where, httpStatus: { gte: 400 } } }),
    db.providerRequestLog.aggregate({ where, _avg: { durationMs: true } }),
    db.providerRequestLog.groupBy({
      by: ['httpStatus'],
      where,
      _count: { _all: true },
      orderBy: { _count: { id: 'desc' } },
    }),
  ]);

  return {
    totalRequests: total,
    errorCount,
    errorRate: total === 0 ? null : errorCount / total,
    avgDurationMs: avgDuration._avg.durationMs,
    statusBreakdown: statusGroups.map((g) => ({ httpStatus: g.httpStatus, count: g._count._all })),
  };
}
