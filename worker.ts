import { Worker } from 'bullmq';
import { redisConnection } from '@/server/queue/connection';
import { processPollJob } from '@/server/queue/spyWorker';
import { apifySpyProvider } from '@/providers/spy/apify.adapter';

const worker = new Worker(
  'poll-spy-result',
  (job) => processPollJob(job, { provider: apifySpyProvider }),
  { connection: redisConnection },
);

console.log(`Worker started, listening on queue: ${worker.name}`);
