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

export const adminRouter = createTRPCRouter({
  overview: adminProcedure.input(dateRangeInput).query(({ input }) => getOverview(input)),

  userActivity: adminProcedure.input(dateRangeInput).query(({ input }) => getUserActivity(input)),

  topKeywords: adminProcedure
    .input(dateRangeInput.extend({ limit: z.number().int().positive().max(100).optional() }))
    .query(({ input }) => getTopKeywords(input)),

  zeroResultKeywords: adminProcedure
    .input(dateRangeInput.extend({ limit: z.number().int().positive().max(200).optional() }))
    .query(({ input }) => getZeroResultKeywords(input)),

  taskStatusTrend: adminProcedure.input(dateRangeInput).query(({ input }) => getTaskStatusTrend(input)),

  providerHealth: adminProcedure.input(dateRangeInput).query(({ input }) => getProviderHealth(input)),
});
