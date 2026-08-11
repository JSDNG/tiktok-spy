import { z } from 'zod';
import { createTRPCRouter, publicProcedure, TRPCError } from '@/server/trpc/init';
import { registerUser } from '@/server/services/registerUser';

const registerInput = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[a-zA-Z]/)
    .regex(/[0-9]/),
  username: z.string().min(3).optional(),
});

export const authRouter = createTRPCRouter({
  register: publicProcedure.input(registerInput).mutation(async ({ input }) => {
    try {
      return await registerUser(input);
    } catch {
      throw new TRPCError({ code: 'CONFLICT', message: 'Email hoặc username đã được sử dụng' });
    }
  }),
});
