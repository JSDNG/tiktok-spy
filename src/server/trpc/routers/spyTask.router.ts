import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, TRPCError } from '@/server/trpc/init';
import { createSpyTask } from '@/server/services/spyTask';
import { listSpyTasks, getSpyTaskDetail } from '@/server/services/spyTaskQuery';
import { spyProvider } from '@/providers/spy';

export const spyTaskRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ keyword: z.string().min(1) }))
    .mutation(({ ctx, input }) =>
      createSpyTask({ userId: ctx.userId, keyword: input.keyword, provider: spyProvider }),
    ),

  list: protectedProcedure.query(({ ctx }) => listSpyTasks({ userId: ctx.userId })),

  getDetail: protectedProcedure
    .input(z.object({ spyTaskId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        return await getSpyTaskDetail({ userId: ctx.userId, spyTaskId: input.spyTaskId });
      } catch {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
    }),
});
