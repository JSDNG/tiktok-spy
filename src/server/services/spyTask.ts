import { db } from '@/server/db';
import { spyQueue } from '@/server/queue/spyQueue';
import { env } from '@/lib/env';
import type { NormalizedSpyItem, SpyProvider } from '@/providers/spy/types';

export async function createSpyTask(params: {
  userId: string;
  keyword: string;
  provider: SpyProvider;
}) {
  const { providerTaskId } = await params.provider.startSpy({ keyword: params.keyword });

  const task = await db.spyTask.create({
    data: {
      userId: params.userId,
      provider: 'apify',
      providerTaskId,
      status: 'PENDING',
      params: { keyword: params.keyword },
    },
  });

  await spyQueue.add('poll-spy-result', { spyTaskId: task.id }, { delay: env.POLL_INITIAL_DELAY_MS });

  return task;
}

export async function persistResult(params: { spyTaskId: string; items: NormalizedSpyItem[] }) {
  const task = await db.spyTask.findUniqueOrThrow({ where: { id: params.spyTaskId } });
  if (task.status === 'SUCCEEDED' || task.status === 'FAILED' || task.status === 'TIMEOUT') {
    return;
  }

  await db.$transaction(async (tx) => {
    await tx.spyTaskItem.createMany({
      data: params.items.map((item) => ({
        spyTaskId: params.spyTaskId,
        provider: 'apify',
        externalId: item.externalId,
        title: item.title,
        imageUrl: item.imageUrl,
        productUrl: item.productUrl,
        shopName: item.shopName,
        category: item.category,
        price: item.price,
        originalPrice: item.originalPrice,
        currency: item.currency,
        soldCount: item.soldCount,
        rating: item.rating,
        reviewCount: item.reviewCount,
      })),
    });

    await tx.spyTask.update({
      where: { id: params.spyTaskId },
      data: { status: 'SUCCEEDED', itemCount: params.items.length, finishedAt: new Date() },
    });
  });
}
