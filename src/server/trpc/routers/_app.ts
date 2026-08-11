import { createTRPCRouter, createCallerFactory } from '@/server/trpc/init';
import { spyTaskRouter } from './spyTask.router';
import { authRouter } from './auth.router';

export const appRouter = createTRPCRouter({ spyTask: spyTaskRouter, auth: authRouter });
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
