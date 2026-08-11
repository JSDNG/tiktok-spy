# Triển khai & vận hành

## Docker Compose — 4 service

| Service | Vai trò | Ghi chú |
|---|---|---|
| `app` | Next.js — UI + tRPC | Cổng public duy nhất (reverse proxy vào đây) |
| `worker` | Node process chạy BullMQ worker | Không expose port, chỉ nối Redis + Postgres |
| `postgres` | PostgreSQL 16 | Volume riêng để dữ liệu sống sót qua rebuild |
| `redis` | Redis 7 | Volume riêng (AOF) để job không mất khi restart |

`app` và `worker` build từ cùng một `Dockerfile` (multi-stage), chỉ khác lệnh khởi động (`CMD`) — vì dùng chung source (ADR-0001).

## Biến môi trường

| Biến | Ý nghĩa | Bắt buộc |
|---|---|---|
| `DATABASE_URL` | Connection string PostgreSQL | Có |
| `REDIS_URL` | Connection string Redis | Có |
| `APIFY_TOKEN` | Token xác thực Apify — chỉ dùng phía `worker` | Có, giữ bí mật |
| `APIFY_ACTOR_ID` | Định danh actor Apify, ví dụ `devcake~tiktok-shop-data-scraper` | Có default |
| `SPY_DEFAULT_CURRENCY` | Tiền tệ mặc định gán cho sản phẩm khi provider không trả field `currency` (ví dụ `"USD"`) | Có default |
| `SPY_MAX_PRODUCTS` | Số sản phẩm tối đa lấy về mỗi lần spy (`maxProducts` gửi trong body `startSpy`), mặc định `20` | Có default |
| `POLL_INITIAL_DELAY_MS` | Độ trễ trước lần poll đầu tiên, mặc định `20000` (20s) — actor cần thời gian khởi động container | Có default |
| `POLL_INTERVAL_MS` | Khoảng cách cố định giữa các lần poll sau đó, mặc định `10000` (10s) | Có default |
| `POLL_TIMEOUT_MS` | Tổng thời gian tối đa chờ một task trước khi đánh dấu `TIMEOUT`, mặc định `180000` (3 phút — gấp 3 lần timeout 60s cấu hình trong body `startSpy`, chừa dư cho overhead khởi động container) | Có default |
| `AUTH_SECRET` | Khoá ký/giải mã JWT của Auth.js | Có, giữ bí mật — sinh bằng `openssl rand -base64 32` |
| `AUTH_SESSION_MAX_AGE` | Thời hạn hiệu lực của JWT (giây), ví dụ `604800` (7 ngày) | Có default |

Validate toàn bộ bằng Zod trong `src/lib/env.ts` — app/worker crash ngay khi khởi động nếu thiếu biến bắt buộc, thay vì lỗi ngầm lúc runtime.

## Quy trình deploy

1. `docker compose build`
2. `docker compose run --rm app npx prisma migrate deploy` — chạy migration trước khi app nhận traffic.
3. `docker compose up -d`
4. Kiểm tra `docker compose logs -f worker` để xác nhận worker kết nối Redis thành công.

## Backup

- PostgreSQL: `pg_dump` định kỳ (cron trên host, ngoài phạm vi container) ghi ra volume ngoài hoặc object storage.
- Redis: chỉ chứa job tạm thời (trạng thái nguồn sự thật nằm ở Postgres) — mất dữ liệu Redis không mất dữ liệu nghiệp vụ, chỉ mất job đang chạy dở (chấp nhận được, task sẽ hiện `PENDING` treo và có thể tạo lại thủ công).

## Quan sát vận hành

- Log ứng dụng: `docker compose logs app` / `docker compose logs worker`.
- Lịch sử gọi API provider: truy vấn bảng `ProviderRequestLog` — không cần công cụ log tập trung ở giai đoạn 1.
- Task bị treo bất thường: query `SpyTask` có `status IN (PENDING, RUNNING)` và `createdAt` quá cũ hơn `POLL_TIMEOUT_MS` — dấu hiệu worker gặp sự cố, cần kiểm tra log worker.
