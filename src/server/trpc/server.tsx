import { createCaller } from './routers/_app';
import { createTRPCContext } from './init';

export async function getServerCaller() {
  const ctx = await createTRPCContext();
  return createCaller(ctx);
}
