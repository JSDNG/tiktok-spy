import { createTRPCRouter, createCallerFactory } from '@/server/trpc/init';
import { spyTaskRouter } from './spyTask.router';
import { authRouter } from './auth.router';
import { adminRouter } from './admin.router';

export const appRouter = createTRPCRouter({ spyTask: spyTaskRouter, auth: authRouter, admin: adminRouter });
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
