import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { env } from '../src/lib/env';

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash(env.SEED_USER_PASSWORD, 10);
  await db.user.upsert({
    where: { email: env.SEED_USER_EMAIL },
    update: {},
    create: { email: env.SEED_USER_EMAIL, passwordHash },
  });
}

main().finally(() => db.$disconnect());
