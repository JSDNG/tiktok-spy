import { z } from 'zod';
import { createTRPCRouter, adminProcedure } from '@/server/trpc/init';
import {
  getOverview,
  getUserActivity,
  getTopKeywords,
  getZeroResultKeywords,
  getTaskStatusTrend,
  getProviderHealth,
} from '@/server/services/adminStats';

const dateRangeInput = z.object({ from: z.coerce.date().optional(), to: z.coerce.date().optional() });

// tRPC ở project này không cấu hình superjson — Date bị JSON.stringify thành string trên wire
// nhưng type suy ra vẫn là Date nếu không tự serialize ở đây, gây lệch giữa type và runtime (NFR-01).
export const adminRouter = createTRPCRouter({
  overview: adminProcedure.input(dateRangeInput).query(({ input }) => getOverview(input)),

  userActivity: adminProcedure.input(dateRangeInput).query(async ({ input }) => {
    const users = await getUserActivity(input);
    return users.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
      lastSpyAt: user.lastSpyAt ? user.lastSpyAt.toISOString() : null,
    }));
  }),

  topKeywords: adminProcedure
    .input(dateRangeInput.extend({ limit: z.number().int().positive().max(100).optional() }))
    .query(({ input }) => getTopKeywords(input)),

  zeroResultKeywords: adminProcedure
    .input(dateRangeInput.extend({ limit: z.number().int().positive().max(200).optional() }))
    .query(async ({ input }) => {
      const tasks = await getZeroResultKeywords(input);
      return tasks.map((task) => ({ ...task, createdAt: task.createdAt.toISOString() }));
    }),

  taskStatusTrend: adminProcedure.input(dateRangeInput).query(async ({ input }) => {
    const rows = await getTaskStatusTrend(input);
    return rows.map((row) => ({ ...row, day: row.day.toISOString() }));
  }),

  providerHealth: adminProcedure.input(dateRangeInput).query(({ input }) => getProviderHealth(input)),
});
