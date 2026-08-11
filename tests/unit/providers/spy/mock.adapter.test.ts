import { describe, expect, it } from 'vitest';
import { mockSpyProvider } from '@/providers/spy/mock.adapter';

describe('mockSpyProvider', () => {
  it('startSpy returns a providerTaskId', async () => {
    const result = await mockSpyProvider.startSpy({ keyword: 'hoodie' });
    expect(result.providerTaskId).toBeTruthy();
  });

  it('fetchResult returns SUCCEEDED with normalized items', async () => {
    const { providerTaskId } = await mockSpyProvider.startSpy({ keyword: 'hoodie' });
    const result = await mockSpyProvider.fetchResult(providerTaskId);
    expect(result.status).toBe('SUCCEEDED');
    if (result.status === 'SUCCEEDED') {
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items[0]).toMatchObject({ currency: 'USD' });
    }
  });
});
