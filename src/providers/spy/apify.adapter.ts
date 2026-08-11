import { env } from '@/lib/env';
import type { NormalizedSpyItem, SpyParams, SpyProvider, SpyResult } from './types';

const APIFY_BASE_URL = 'https://api.apify.com/v2';

interface ApifyRunResponse {
  data: {
    id?: string;
    status: string;
    statusMessage?: string;
    defaultDatasetId?: string;
  };
}

interface ApifyDatasetItem {
  product_id: string;
  title: string;
  image_url: string;
  url: string;
  price: number;
  currency: string;
  seller_name?: string;
  sold_count?: number;
  rating?: number;
  review_count?: number;
}

function normalizeApifyItem(raw: ApifyDatasetItem): NormalizedSpyItem {
  return {
    externalId: raw.product_id,
    title: raw.title,
    imageUrl: raw.image_url,
    productUrl: raw.url,
    shopName: raw.seller_name,
    price: Math.round(raw.price * 100),
    currency: raw.currency || env.SPY_DEFAULT_CURRENCY,
    soldCount: raw.sold_count,
    rating: raw.rating,
    reviewCount: raw.review_count,
  };
}

async function startSpy(params: SpyParams): Promise<{ providerTaskId: string }> {
  const response = await fetch(
    `${APIFY_BASE_URL}/actors/${env.APIFY_ACTOR_ID}/runs?token=${env.APIFY_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        includeReviews: false,
        searchKeywords: [params.keyword],
        maxProducts: env.SPY_MAX_PRODUCTS,
        sortBySoldCount: 'highest_first',
        maxRetries: 5,
        requestDelay: 0,
        timeout: 60,
      }),
    },
  );
  const body = (await response.json()) as ApifyRunResponse;
  return { providerTaskId: body.data.id ?? '' };
}

async function fetchResult(providerTaskId: string): Promise<SpyResult> {
  const statusResponse = await fetch(
    `${APIFY_BASE_URL}/actor-runs/${providerTaskId}?token=${env.APIFY_TOKEN}`,
  );
  const statusBody = (await statusResponse.json()) as ApifyRunResponse;
  const { status, statusMessage, defaultDatasetId } = statusBody.data;

  if (status === 'READY' || status === 'RUNNING' || status === 'TIMING-OUT' || status === 'ABORTING') {
    return { status: 'RUNNING' };
  }

  if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
    return { status: 'FAILED', errorMessage: statusMessage ?? 'Apify run failed' };
  }

  const itemsResponse = await fetch(
    `${APIFY_BASE_URL}/datasets/${defaultDatasetId}/items?token=${env.APIFY_TOKEN}`,
  );
  const rawItems = (await itemsResponse.json()) as ApifyDatasetItem[];

  return { status: 'SUCCEEDED', items: rawItems.map(normalizeApifyItem) };
}

export const apifySpyProvider: SpyProvider = { startSpy, fetchResult };
