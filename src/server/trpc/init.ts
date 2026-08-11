import { initTRPC, TRPCError } from '@trpc/server';
import { auth } from '@/server/auth';

export async function createTRPCContext() {
  const session = await auth();
  return { userId: session?.user?.id };
}

const t = initTRPC.context<{ userId: string | undefined }>().create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { userId: ctx.userId } });
});

export { TRPCError };
