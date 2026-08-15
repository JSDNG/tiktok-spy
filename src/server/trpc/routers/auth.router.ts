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
    } catch (error) {
      // registerUser() chỉ throw Error với message cụ thể (email/username đã dùng) — giữ nguyên
      // message đó thay vì gộp chung, để người dùng biết chính xác trường nào bị trùng.
      const message = error instanceof Error ? error.message : 'Email hoặc username đã được sử dụng';
      throw new TRPCError({ code: 'CONFLICT', message });
    }
  }),
});
