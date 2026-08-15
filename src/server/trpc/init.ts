import { initTRPC, TRPCError } from '@trpc/server';
import { ZodError } from 'zod';
import type { Role } from '@prisma/client';
import { auth } from '@/server/auth';

export async function createTRPCContext() {
  const session = await auth();
  return { userId: session?.user?.id, role: session?.user?.role };
}

const t = initTRPC.context<{ userId: string | undefined; role: Role | undefined }>().create({
  errorFormatter({ shape, error }) {
    if (!(error.cause instanceof ZodError)) return shape;
    // Mặc định tRPC nhét nguyên mảng issues của ZodError vào message — gộp lại thành 1 dòng
    // để UI hiển thị được thẳng, không phải tự parse JSON ở phía client.
    return { ...shape, message: error.cause.issues.map((issue) => issue.message).join('; ') };
  },
});

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
