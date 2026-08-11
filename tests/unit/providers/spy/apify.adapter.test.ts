import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apifySpyProvider } from '@/providers/spy/apify.adapter';

function mockFetchSequence(responses: unknown[]) {
  const fn = vi.fn();
  for (const body of responses) {
    fn.mockResolvedValueOnce({ ok: true, json: async () => body });
  }
  vi.stubGlobal('fetch', fn);
  return fn;
}

describe('apifySpyProvider', () => {
  beforeEach(() => vi.unstubAllGlobals());

  it('startSpy posts to Apify runs endpoint and returns the run id', async () => {
    const fetchMock = mockFetchSequence([{ data: { id: 'run-1', status: 'READY' } }]);
    const result = await apifySpyProvider.startSpy({ keyword: 'hoodie' });
    expect(result.providerTaskId).toBe('run-1');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/actors/'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('fetchResult maps RUNNING status without fetching dataset', async () => {
    const fetchMock = mockFetchSequence([{ data: { status: 'RUNNING' } }]);
    const result = await apifySpyProvider.fetchResult('run-1');
    expect(result.status).toBe('RUNNING');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('fetchResult maps FAILED status with statusMessage as errorMessage', async () => {
    mockFetchSequence([{ data: { status: 'FAILED', statusMessage: 'boom' } }]);
    const result = await apifySpyProvider.fetchResult('run-1');
    expect(result).toEqual({ status: 'FAILED', errorMessage: 'boom' });
  });

  it('fetchResult maps ABORTED and TIMED-OUT to FAILED', async () => {
    mockFetchSequence([{ data: { status: 'ABORTED', statusMessage: 'aborted by user' } }]);
    const aborted = await apifySpyProvider.fetchResult('run-1');
    expect(aborted.status).toBe('FAILED');

    vi.unstubAllGlobals();
    mockFetchSequence([{ data: { status: 'TIMED-OUT', statusMessage: 'timed out' } }]);
    const timedOut = await apifySpyProvider.fetchResult('run-1');
    expect(timedOut.status).toBe('FAILED');
  });

  it('fetchResult maps TIMING-OUT and ABORTING to RUNNING (still in progress)', async () => {
    mockFetchSequence([{ data: { status: 'TIMING-OUT' } }]);
    const result = await apifySpyProvider.fetchResult('run-1');
    expect(result.status).toBe('RUNNING');
  });

  it('fetchResult fetches dataset and converts price to cents when SUCCEEDED', async () => {
    mockFetchSequence([
      { data: { status: 'SUCCEEDED', defaultDatasetId: 'ds-1' } },
      [
        {
          product_id: '1',
          title: 'Hoodie',
          image_url: 'img',
          url: 'url',
          price: 12.9,
          currency: 'USD',
          sold_count: 5,
          seller_name: 'XGBY',
          rating: 4.2,
          review_count: 3,
        },
      ],
    ]);
    const result = await apifySpyProvider.fetchResult('run-1');
    expect(result.status).toBe('SUCCEEDED');
    if (result.status === 'SUCCEEDED') {
      expect(result.items[0]).toMatchObject({
        externalId: '1',
        title: 'Hoodie',
        imageUrl: 'img',
        productUrl: 'url',
        price: 1290,
        currency: 'USD',
        soldCount: 5,
        shopName: 'XGBY',
        rating: 4.2,
        reviewCount: 3,
      });
    }
  });
});
