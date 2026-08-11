import { Queue } from 'bullmq';
import { redisConnection } from './connection';

export const spyQueue = new Queue('poll-spy-result', { connection: redisConnection });
