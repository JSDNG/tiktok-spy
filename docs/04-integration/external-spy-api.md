# Hợp đồng tích hợp: API Spy bên ngoài

Provider: **Apify** — actor mặc định `devcake~tiktok-shop-data-scraper` (đọc từ `APIFY_ACTOR_ID`). Xác thực bằng token qua query param `?token=...`, đọc từ biến môi trường `APIFY_TOKEN` (xem [deployment.md](../05-operations/deployment.md)).

## Interface nội bộ (`src/providers/spy/types.ts`)

```typescript
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
  price: number;          // đơn vị nhỏ nhất (cent), số nguyên
  originalPrice?: number; // đơn vị nhỏ nhất (cent), số nguyên — giá trước giảm
  currency: string;       // ISO 4217
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

## Adapter Apify (`apify.adapter.ts`)

### `startSpy(params)`

```
POST https://api.apify.com/v2/actors/{APIFY_ACTOR_ID}/runs?token={APIFY_TOKEN}
Content-Type: application/json

{
  "includeReviews": false,
  "searchKeywords": ["<params.keyword>"],
  "maxProducts": <SPY_MAX_PRODUCTS>,
  "sortBySoldCount": "highest_first",
  "maxRetries": 5,
  "requestDelay": 0,
  "timeout": 60
}
```

`searchKeywords` điền động từ `params.keyword`, `maxProducts` đọc từ biến môi trường `SPY_MAX_PRODUCTS` (mặc định `20`) — hai trường duy nhất không cố định cứng trong code. Các trường còn lại (`includeReviews`, `sortBySoldCount`, `maxRetries`, `requestDelay`, `timeout`) giữ giá trị cố định trong adapter, không expose ra `SpyParams` hay biến môi trường.

Response (`201`) là một Actor Run object; lấy `data.id` làm `providerTaskId`:

```json
{ "data": { "id": "HG7ML7M8z78YcAPEB", "status": "READY", "defaultDatasetId": "wmKPijuyDnPZAPRMk", "...": "..." } }
```

`providerTaskId` lưu vào `SpyTask.providerTaskId` chính là **run id** (`data.id`), không phải `defaultDatasetId` — lý do ở phần dưới.

### `fetchResult(providerTaskId)`

Thực hiện tối đa 2 lệnh gọi HTTP tới Apify bên trong hàm này — worker chỉ thấy một hàm `fetchResult` duy nhất, không biết chi tiết bên trong:

**Bước 1 — kiểm tra trạng thái run:**

```
GET https://api.apify.com/v2/actor-runs/{providerTaskId}?token={APIFY_TOKEN}
```

Đọc `data.status`:

| `status` của Apify | Map sang `SpyResult.status` |
|---|---|
| `READY`, `RUNNING` | `RUNNING` |
| `SUCCEEDED` | tiếp Bước 2 |
| `FAILED`, `ABORTED`, `TIMED-OUT` | `FAILED` (dùng `data.statusMessage` làm `errorMessage`) |
| `TIMING-OUT`, `ABORTING` | `RUNNING` (đang trong quá trình chuyển sang trạng thái kết thúc) |

**Bước 2 — chỉ gọi khi `status = SUCCEEDED`, lấy dữ liệu:**

```
GET https://api.apify.com/v2/datasets/{data.defaultDatasetId}/items?token={APIFY_TOKEN}
```

`defaultDatasetId` lấy từ chính response Bước 1 — không cần lưu riêng trong DB. Response là mảng object phẳng, mỗi phần tử một sản phẩm — chuẩn hoá từng phần tử thành `NormalizedSpyItem` rồi trả `{ status: 'SUCCEEDED', items }`.

**Vì sao không gọi thẳng `GET /datasets/{id}/items` mà bỏ qua bước kiểm tra status:** dataset được actor đẩy dữ liệu vào **dần dần trong lúc chạy**, không đợi xong mới có. Gọi thẳng dataset items có thể đọc trúng lúc actor mới scrape được vài sản phẩm (chưa xong) hoặc đang giữa chừng khi actor gặp lỗi — dẫn tới lưu nhầm dữ liệu thiếu là kết quả cuối cùng. Bước kiểm tra `status` đảm bảo chỉ đọc dataset khi actor đã thật sự `SUCCEEDED`.

## Mẫu response thật của `GET /datasets/{id}/items` (một phần tử)

```json
{
  "product_id": "1732510032571502796",
  "title": "4-Pack Men Autumn Winter Quarter Zip Hooded Sweatshirts ...",
  "url": "https://shop.tiktok.com/us/pdp/1732510032571502796",
  "price": 12.9,
  "price_formatted": "12.90",
  "currency": "USD",
  "rating": 0,
  "review_count": 0,
  "seller_id": "7494516858865091788",
  "seller_name": "XGBY",
  "image_url": "https://p16-oec-general-useast5.ttcdn-us.com/...webp",
  "sold_count": 2846,
  "is_sold_out": true,
  "creator_count": 0,
  "has_creator_data": false,
  "total_creator_videos": 0,
  "reviews_fetched": 0,
  "reviews_accessible": false,
  "scraped_at": "2026-08-11T01:40:09.701118",
  "source": "product_page"
}
```

## Bảng ánh xạ trường

| Trường nội bộ | Field của provider | Ghi chú |
|---|---|---|
| `NormalizedSpyItem.externalId` | `product_id` | |
| `NormalizedSpyItem.title` | `title` | |
| `NormalizedSpyItem.imageUrl` | `image_url` | |
| `NormalizedSpyItem.productUrl` | `url` | |
| `NormalizedSpyItem.shopName` | `seller_name` | |
| `NormalizedSpyItem.category` | — | Provider không trả field này; để `undefined` |
| `NormalizedSpyItem.price` | `price` | **Chuyển đổi bắt buộc:** provider trả số thập phân đô la (`12.9`) → adapter nhân `100`, làm tròn (`Math.round`) thành cent (`1290`). Bỏ qua `price_formatted` (chuỗi hiển thị, không dùng). |
| `NormalizedSpyItem.originalPrice` | — | Provider không trả field này trong response thực tế; luôn `undefined` với provider hiện tại |
| `NormalizedSpyItem.currency` | `currency` | Lấy trực tiếp từ provider (`"USD"`); dùng `SPY_DEFAULT_CURRENCY` chỉ khi field này thiếu/rỗng |
| `NormalizedSpyItem.rating` | `rating` | |
| `NormalizedSpyItem.reviewCount` | `review_count` | |
| `NormalizedSpyItem.soldCount` | `sold_count` | |
| `seller_id` | *(không map)* | Có trong response nhưng không dùng ở MVP — đã có `seller_name` |
| `price_formatted`, `is_sold_out`, `creator_count`, `has_creator_data`, `total_creator_videos`, `reviews_fetched`, `reviews_accessible`, `scraped_at`, `source` | *(không map)* | Ngoài phạm vi MVP |

## Quyết định thiết kế

| Vấn đề | Quyết định |
|---|---|
| `sold_count` là luỹ kế hay theo khoảng thời gian? | Không diễn giải hay quy đổi — lấy nguyên giá trị `sold_count` provider trả về, hiển thị thẳng lên UI. Ý nghĩa con số (luỹ kế toàn thời gian hay theo mốc nào) do provider quyết định, hệ thống không tính toán lại. |
| Sản phẩm có luôn là USD không? | Có — hệ thống chỉ hỗ trợ USD ở giai đoạn này. `currency` vẫn lấy từ field provider (không hardcode), `SPY_DEFAULT_CURRENCY` (env, mặc định `USD`) chỉ là fallback khi thiếu field. |
| Giới hạn số sản phẩm mỗi lần spy | Cấu hình qua `SPY_MAX_PRODUCTS` (env, mặc định `20`), không phân trang lấy thêm — đạt tới giới hạn là dừng. |

## Rate limit

Theo tài liệu chính thức của Apify:

| Loại giới hạn | Giá trị |
|---|---|
| Toàn cục (theo token) | 250.000 request/phút |
| Theo resource, mặc định | 60 request/giây/resource |
| Theo resource — chạy actor, push dataset item | 400 request/giây/resource |

Với `POLL_INTERVAL_MS = 10000` và worker concurrency mặc định (`1`, xem [job-pipeline.md](../02-architecture/job-pipeline.md)), hệ thống gửi khoảng **0.1 request/giây** — thấp hơn giới hạn hàng trăm đến hàng nghìn lần. Không cần thêm cơ chế giới hạn tần suất phía mình; lỗi `429` (nếu có) được xử lý chung với lỗi mạng/5xx qua retry/backoff của BullMQ.

## Bảo mật

- `APIFY_TOKEN` chỉ đọc từ biến môi trường phía server (`worker`), không bao giờ truyền xuống client — đáp ứng NFR-05.
- Mọi lời gọi HTTP tới Apify được ghi vào `ProviderRequestLog` (endpoint, mã trạng thái, thời gian phản hồi) để gỡ lỗi mà không cần log payload nhạy cảm.
