export interface SpyParams {
  keyword: string;
}

export interface NormalizedSpyItem {
  externalId: string;
  title: string;
  imageUrl: string;
  productUrl: string;
  shopName?: string;
  category?: string;
  price: number; // đơn vị nhỏ nhất (cent), số nguyên
  originalPrice?: number; // đơn vị nhỏ nhất (cent), số nguyên — giá trước giảm
  currency: string; // ISO 4217
  soldCount?: number;
  rating?: number;
  reviewCount?: number;
}

export type SpyResult =
  | { status: 'PENDING' | 'RUNNING' }
  | { status: 'SUCCEEDED'; items: NormalizedSpyItem[] }
  | { status: 'FAILED'; errorMessage: string };

export interface SpyProvider {
  /** Gọi API khởi tạo spy, trả về providerTaskId để poll sau. */
  startSpy(params: SpyParams): Promise<{ providerTaskId: string }>;
  /** Gọi API lấy kết quả theo providerTaskId. */
  fetchResult(providerTaskId: string): Promise<SpyResult>;
}
