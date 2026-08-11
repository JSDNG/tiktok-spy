import { initTRPC, TRPCError } from '@trpc/server';
import { db } from '@/server/db';
import { env } from '@/lib/env';

export async function createTRPCContext() {
  const seedUser = await db.user.findUniqueOrThrow({ where: { email: env.SEED_USER_EMAIL } });
  return { userId: seedUser.id };
}

const t = initTRPC.context<{ userId: string }>().create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;
export { TRPCError };
