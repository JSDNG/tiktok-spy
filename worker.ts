import { Worker } from 'bullmq';
import { redisConnection } from '@/server/queue/connection';
import { processPollJob } from '@/server/queue/spyWorker';
import { spyProvider } from '@/providers/spy';

const worker = new Worker(
  'poll-spy-result',
  (job) => processPollJob(job, { provider: spyProvider }),
  { connection: redisConnection },
);

console.log(`Worker started, listening on queue: ${worker.name}`);
