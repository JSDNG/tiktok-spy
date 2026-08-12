import { initTRPC, TRPCError } from '@trpc/server';
import type { Role } from '@prisma/client';
import { auth } from '@/server/auth';

export async function createTRPCContext() {
  const session = await auth();
  return { userId: session?.user?.id, role: session?.user?.role };
}

const t = initTRPC.context<{ userId: string | undefined; role: Role | undefined }>().create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { userId: ctx.userId, role: ctx.role } });
});

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.role !== 'ADMIN') throw new TRPCError({ code: 'FORBIDDEN' });
  return next({ ctx });
});

export { TRPCError };
