import type { SpyProvider } from './types';

export const mockSpyProvider: SpyProvider = {
  async startSpy() {
    return { providerTaskId: `mock-${Date.now()}` };
  },
  async fetchResult() {
    return {
      status: 'SUCCEEDED',
      items: [
        {
          externalId: 'mock-1',
          title: 'Mock Hoodie',
          imageUrl: 'https://example.com/mock.webp',
          productUrl: 'https://example.com/mock',
          shopName: 'Mock Shop',
          price: 1290,
          currency: 'USD',
          soldCount: 100,
          rating: 4.5,
          reviewCount: 10,
        },
      ],
    };
  },
};
