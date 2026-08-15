import { z } from 'zod';
import { createTRPCRouter, publicProcedure, TRPCError } from '@/server/trpc/init';
import { registerUser } from '@/server/services/registerUser';

const registerInput = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/[a-zA-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ cái')
    .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 chữ số'),
  username: z.string().min(3, 'Username phải có ít nhất 3 ký tự').optional(),
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
