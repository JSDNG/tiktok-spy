import { createTRPCRouter, createCallerFactory } from '@/server/trpc/init';
import { spyTaskRouter } from './spyTask.router';

export const appRouter = createTRPCRouter({ spyTask: spyTaskRouter });
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
