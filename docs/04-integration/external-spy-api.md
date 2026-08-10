# Hợp đồng tích hợp: API Spy bên ngoài

> **Trạng thái: đã có mẫu response cho `fetchResult` (phần sản phẩm), còn thiếu spec của `startSpy` request/response và cơ chế phân trang/lỗi.** Interface dưới đây là hợp đồng nội bộ đã chốt (xem [ADR-0004](../03-decisions/adr-0004-provider-adapter-layer.md)). Các mục còn `*(chờ spec)*` cần bạn cung cấp thêm khi có tài liệu đầy đủ từ nhà cung cấp.

## Interface nội bộ (`src/providers/spy/types.ts`)

```typescript
export interface SpyParams {
  keyword: string;
}

export interface NormalizedSpyItem {
  externalId: string;     // ID sản phẩm phía provider (product_id) — lưu thẳng vào SpyTaskItem mỗi lần spy
  title: string;
  imageUrl: string;
  productUrl: string;
  shopName?: string;
  category?: string;
  price: number;          // đơn vị nhỏ nhất (cent), số nguyên
  originalPrice?: number; // đơn vị nhỏ nhất (cent), số nguyên — giá trước giảm
  currency: string;       // ISO 4217 — KHÔNG lấy từ provider này, xem ghi chú bên dưới
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
```

## Mẫu response thật (phần sản phẩm, do bạn cung cấp)

```json
{
  "image_url": "https://p16-oec-general.ttcdn-us.com/tos-maliva-i-o3syd03w52-us/...webp",
  "title": "Men's Fall/Winter Spider-Print Hooded Sweatshirt ...",
  "price": 6.99,
  "original_price": 13.98,
  "discount": "50%",
  "rating": 0,
  "review_count": 0,
  "sold_count": 86,
  "seller_name": "TIKKFASHION",
  "url": "https://shop.tiktok.com/us/pdp/1732534527327769383",
  "product_id": "1732534527327769383"
}
```

Đây là dạng dữ liệu **sau khi task đã `SUCCEEDED`** — chưa rõ nó nằm trực tiếp trong response của `fetchResult()` hay phải gọi thêm một bước khác để lấy danh sách item theo `taskId`. Cần xác nhận thêm cấu trúc bao ngoài (có field `status`, `task_id`, phân trang bao quanh mảng sản phẩm này không).

## Bảng ánh xạ trường

| Trường nội bộ | Field của provider | Ghi chú |
|---|---|---|
| `NormalizedSpyItem.externalId` | `product_id` | Lưu thẳng vào `SpyTaskItem` mỗi lần spy — không dùng làm khoá upsert (hệ thống không upsert) |
| `NormalizedSpyItem.title` | `title` | |
| `NormalizedSpyItem.imageUrl` | `image_url` | |
| `NormalizedSpyItem.productUrl` | `url` | |
| `NormalizedSpyItem.shopName` | `seller_name` | |
| `NormalizedSpyItem.category` | — | Provider không trả field này trong mẫu đã có; để `undefined` |
| `NormalizedSpyItem.price` | `price` | **Chuyển đổi bắt buộc:** provider trả số thập phân đô la (`6.99`) → adapter nhân `100`, làm tròn (`Math.round`) thành cent (`699`) |
| `NormalizedSpyItem.originalPrice` | `original_price` | Cùng cách chuyển đổi như `price` (`13.98 → 1398`) |
| `NormalizedSpyItem.currency` | — | Provider không trả field này → adapter gán cứng từ `SPY_DEFAULT_CURRENCY` (mặc định `"USD"`), không đọc từ payload |
| `NormalizedSpyItem.rating` | `rating` | |
| `NormalizedSpyItem.reviewCount` | `review_count` | |
| `NormalizedSpyItem.soldCount` | `sold_count` | |
| `discount` (field `"50%"` của provider) | *(không map)* | Không lưu — tính lại `% giảm` ở UI từ `price`/`originalPrice` khi cả hai đều có |
| `SpyParams.keyword` | *(chờ spec)* | |
| `startSpy()` request | *(chờ spec)* | Method, endpoint, auth header |
| `startSpy()` response → `providerTaskId` | *(chờ spec)* | |
| `fetchResult()` request | *(chờ spec)* | Endpoint, tần suất tối đa được phép gọi |
| `fetchResult()` response → `status` | *(chờ spec)* | Provider dùng mã trạng thái nào cho "đang xử lý" / "xong" / "lỗi"? Response mẫu ở trên chỉ thấy mảng sản phẩm, chưa thấy field trạng thái bao ngoài |
| Phân trang | *(chờ spec)* | Một task nhiều sản phẩm — lấy hết 1 lần hay phải gọi nhiều trang? |

## Câu hỏi cần làm rõ với nhà cung cấp

1. **Xác thực:** API key qua header hay query param? Có cần ký request không?
2. **Giới hạn tần suất:** rate limit của cả `startSpy` và `fetchResult` là bao nhiêu req/phút?
3. **Thời gian xử lý:** trung bình/tối đa provider mất bao lâu để xử lý xong một task? (quyết định `delay` khởi tạo và `POLL_TIMEOUT_MS`)
4. **Phân trang:** nếu một task trả về nhiều sản phẩm, có phân trang không? Lấy hết trong một lần gọi `fetchResult` hay phải gọi nhiều lần?
5. **Mã lỗi:** danh sách mã lỗi có thể trả về, ý nghĩa của từng mã.
6. **Hết hạn `taskId`:** `providerTaskId` có hết hạn sau bao lâu nếu không poll kịp?
7. **Cấu trúc response bao ngoài:** mẫu đã có chỉ là mảng sản phẩm — field `status`/`task_id` (nếu có) nằm ở đâu trong response thật của `fetchResult`?
8. **`sold_count` là luỹ kế hay theo khoảng thời gian?** Ảnh hưởng tới cách diễn giải số liệu này trên UI.
9. **Có phải mọi sản phẩm đều là USD không**, hay có shop bán ở khu vực khác trả tiền tệ khác? (hiện đang mặc định `USD` cho toàn hệ thống qua `SPY_DEFAULT_CURRENCY`)

## Bảo mật

- `SPY_API_KEY` chỉ đọc từ biến môi trường phía server (`worker` và/hoặc `app` tuỳ nơi gọi `startSpy`), không bao giờ truyền xuống client — đáp ứng NFR-05.
- Mọi lời gọi HTTP tới provider được ghi vào `ProviderRequestLog` (endpoint, mã trạng thái, thời gian phản hồi) để gỡ lỗi mà không cần log payload nhạy cảm.
